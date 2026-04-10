import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import { join, resolve } from 'path';

import {
  CreateFunctionCommand,
  type CreateFunctionCommandInput,
  DeleteFunctionCommand,
  DeleteLayerVersionCommand,
  GetFunctionCommand,
  InvokeCommand,
  type InvokeCommandInput,
  Lambda,
  type LambdaClientConfig,
  ListLayerVersionsCommand,
  type ListLayerVersionsCommandInput,
  LogType,
  PublishLayerVersionCommand,
  ResourceNotFoundException,
  waitUntilFunctionActiveV2,
} from '@aws-sdk/client-lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isDefined } from 'twenty-shared/utils';

import {
  type LogicFunctionDriver,
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
  type LogicFunctionTranspileParams,
  type LogicFunctionTranspileResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { isNonEmptyString } from '@sniptt/guards';
import { ASSET_PATH } from 'src/constants/assets-path';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { COMMON_LAYER_DEPENDENCIES_DIRNAME } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/common-layer-dependencies-dirname';
import { callWithTimeout } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/call-with-timeout';
import { copyBuilder } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-builder';
import { copyCommonLayerDependencies } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-common-layer-dependencies';
import { copyExecutor } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-executor';
import { copyYarnInstall } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-yarn-install';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS = 60;
const CREDENTIALS_DURATION_IN_SECONDS = 60 * 60; // 1h
const YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS = 300;
const YARN_INSTALL_LAMBDA_MEMORY_MB = 1024;
const COMMON_LAYER_NAME_PREFIX = 'twenty-common-layer';
const BUILDER_LAMBDA_TIMEOUT_SECONDS = 60;
const BUILDER_LAMBDA_MEMORY_MB = 512;
const LAMBDA_EPHEMERAL_STORAGE_MB = 2048;
const YARN_INSTALL_HANDLER_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/yarn-install/index.mjs',
  ),
);

const BUILDER_HANDLER_PATH = resolve(
  __dirname,
  join(
    ASSET_PATH,
    'engine/core-modules/logic-function/logic-function-drivers/constants/builder/index.mjs',
  ),
);

type LambdaDriverExecutorPayload = {
  code: string;
  params: object;
  env: Record<string, string>;
  handlerName: string;
};

export type YarnInstallLambdaPayload = {
  action: 'createLayer';
  packageJson: string;
  yarnLock: string;
  presignedUploadUrl: string;
};

export type YarnInstallLambdaResult = {
  success: boolean;
};

export type BuilderLambdaPayload = {
  action: 'transpile';
  sourceCode: string;
  sourceFileName: string;
  builtFileName: string;
};

export type BuilderLambdaResult = {
  builtCode: string;
};

export interface LambdaDriverOptions extends LambdaClientConfig {
  logicFunctionResourceService: LogicFunctionResourceService;
  sdkClientArchiveService: SdkClientArchiveService;
  cacheLockService: CacheLockService;
  region: string;
  lambdaRole: string;
  subhostingRole?: string;
  layerBucket: string;
  layerBucketRegion: string;
}

export class LambdaDriver implements LogicFunctionDriver {
  private lambdaClient: Lambda | undefined;
  private assumeRoleCredentials:
    | { accessKeyId: string; secretAccessKey: string; sessionToken: string }
    | undefined;
  private credentialsExpiry: Date | null = null;
  private readonly options: LambdaDriverOptions;
  private readonly logicFunctionResourceService: LogicFunctionResourceService;
  private readonly sdkClientArchiveService: SdkClientArchiveService;
  private readonly cacheLockService: CacheLockService;

  constructor(options: LambdaDriverOptions) {
    this.options = options;
    this.lambdaClient = undefined;
    this.logicFunctionResourceService = options.logicFunctionResourceService;
    this.sdkClientArchiveService = options.sdkClientArchiveService;
    this.cacheLockService = options.cacheLockService;
  }

  private areAssumeRoleCredentialsExpired(): boolean {
    return (
      !isDefined(this.assumeRoleCredentials) ||
      (isDefined(this.credentialsExpiry) &&
        new Date() >= this.credentialsExpiry)
    );
  }

  private async refreshAssumeRoleCredentials() {
    const stsClient = new STSClient({ region: this.options.region });

    const assumeRoleCommand = new AssumeRoleCommand({
      RoleArn: this.options.subhostingRole,
      RoleSessionName: 'LambdaSession',
      DurationSeconds: CREDENTIALS_DURATION_IN_SECONDS,
    });

    const { Credentials } = await stsClient.send(assumeRoleCommand);

    if (
      !isDefined(Credentials) ||
      !isDefined(Credentials.AccessKeyId) ||
      !isDefined(Credentials.SecretAccessKey) ||
      !isDefined(Credentials.SessionToken)
    ) {
      throw new Error('Failed to assume role');
    }

    this.assumeRoleCredentials = {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    };

    this.credentialsExpiry = new Date(
      Date.now() + (CREDENTIALS_DURATION_IN_SECONDS - 60 * 5) * 1000,
    );

    this.lambdaClient = undefined;
  }

  private async getAssumeRoleCredentials() {
    if (this.areAssumeRoleCredentialsExpired()) {
      await this.refreshAssumeRoleCredentials();
    }

    return this.assumeRoleCredentials!;
  }

  private async getLambdaClient() {
    if (
      !isDefined(this.lambdaClient) ||
      (isDefined(this.options.subhostingRole) &&
        this.areAssumeRoleCredentialsExpired())
    ) {
      this.lambdaClient = new Lambda({
        ...this.options,
        ...(isDefined(this.options.subhostingRole) && {
          credentials: await this.getAssumeRoleCredentials(),
        }),
      });
    }

    return this.lambdaClient;
  }

  private async generatePresignedUploadUrl(
    s3Key: string,
    expiresIn: number = 300,
  ): Promise<string> {
    const s3Client = new S3Client({
      region: this.options.layerBucketRegion,
      credentials: isDefined(this.options.subhostingRole)
        ? await this.getAssumeRoleCredentials()
        : this.options.credentials,
    });

    const putCommand = new PutObjectCommand({
      Bucket: this.options.layerBucket,
      Key: s3Key,
      ContentType: 'application/zip',
    });

    return getSignedUrl(s3Client, putCommand, { expiresIn });
  }

  private async waitFunctionActive(
    functionName: string,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ) {
    await waitUntilFunctionActiveV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      { FunctionName: functionName },
    );
  }

  private getDepsLayerName(flatApplication: FlatApplication): string {
    const checksum = flatApplication.yarnLockChecksum ?? 'default';

    return `deps-${checksum}`;
  }

  private getSdkLayerName({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): string {
    return `sdk-${workspaceId}-${applicationUniversalIdentifier}`;
  }

  private yarnInstallFunctionName: string | undefined;
  private builderFunctionName: string | undefined;
  private commonLayerName: string | undefined;

  private async getCommonLayerName(): Promise<string> {
    if (isDefined(this.commonLayerName)) {
      return this.commonLayerName;
    }

    const [packageJson, yarnLock] = await Promise.all([
      fs.readFile(
        join(COMMON_LAYER_DEPENDENCIES_DIRNAME, 'package.json'),
        'utf-8',
      ),
      fs.readFile(
        join(COMMON_LAYER_DEPENDENCIES_DIRNAME, 'yarn.lock'),
        'utf-8',
      ),
    ]);

    const checksum = createHash('sha256')
      .update(packageJson)
      .update(yarnLock)
      .digest('hex')
      .slice(0, 12);

    this.commonLayerName = `${COMMON_LAYER_NAME_PREFIX}-${checksum}`;

    return this.commonLayerName;
  }

  private async getYarnInstallFunctionName(): Promise<string> {
    if (isDefined(this.yarnInstallFunctionName)) {
      return this.yarnInstallFunctionName;
    }

    const handlerContent = await fs.readFile(
      YARN_INSTALL_HANDLER_PATH,
      'utf-8',
    );
    const checksum = createHash('sha256')
      .update(handlerContent)
      .digest('hex')
      .slice(0, 12);

    this.yarnInstallFunctionName = `twenty-yarn-install-${checksum}`;

    return this.yarnInstallFunctionName;
  }

  private async getBuilderFunctionName(): Promise<string> {
    if (isDefined(this.builderFunctionName)) {
      return this.builderFunctionName;
    }

    const handlerContent = await fs.readFile(BUILDER_HANDLER_PATH, 'utf-8');
    const checksum = createHash('sha256')
      .update(handlerContent)
      .digest('hex')
      .slice(0, 12);

    this.builderFunctionName = `twenty-builder-${checksum}`;

    return this.builderFunctionName;
  }

  private async ensureCommonLayerExists(): Promise<string> {
    const commonLayerName = await this.getCommonLayerName();
    const existingArn = await this.getExistingLayerArn(commonLayerName);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await copyCommonLayerDependencies(sourceTemporaryDir);

      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      const lambdaClient = await this.getLambdaClient();

      const result = await lambdaClient.send(
        new PublishLayerVersionCommand({
          LayerName: commonLayerName,
          Content: { ZipFile: await fs.readFile(lambdaZipPath) },
          CompatibleRuntimes: [
            LogicFunctionRuntime.NODE18,
            LogicFunctionRuntime.NODE22,
          ],
        }),
      );

      if (!result.LayerVersionArn) {
        throw new Error(
          'PublishLayerVersion did not return a LayerVersionArn for common layer',
        );
      }

      return result.LayerVersionArn;
    } finally {
      await temporaryDirManager.clean();
    }
  }

  private async ensureYarnInstallLambdaExists(): Promise<void> {
    const yarnInstallFunctionName = await this.getYarnInstallFunctionName();
    const lambdaClient = await this.getLambdaClient();

    try {
      await lambdaClient.send(
        new GetFunctionCommand({ FunctionName: yarnInstallFunctionName }),
      );

      return;
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }

    const commonLayerArn = await this.ensureCommonLayerExists();

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await copyYarnInstall(sourceTemporaryDir);

      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      const params: CreateFunctionCommandInput = {
        Code: {
          ZipFile: await fs.readFile(lambdaZipPath),
        },
        FunctionName: yarnInstallFunctionName,
        Layers: [commonLayerArn],
        Handler: 'index.handler',
        Role: this.options.lambdaRole,
        Runtime: LogicFunctionRuntime.NODE22,
        Timeout: YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
        MemorySize: YARN_INSTALL_LAMBDA_MEMORY_MB,
        EphemeralStorage: { Size: LAMBDA_EPHEMERAL_STORAGE_MB },
      };

      await lambdaClient.send(new CreateFunctionCommand(params));
    } finally {
      await temporaryDirManager.clean();
    }

    await this.waitFunctionActive(yarnInstallFunctionName);
  }

  private async invokeYarnInstallLambda(
    payload: YarnInstallLambdaPayload,
  ): Promise<YarnInstallLambdaResult> {
    const lambdaClient = await this.getLambdaClient();

    const yarnInstallFunctionName = await this.getYarnInstallFunctionName();

    const result = await callWithTimeout({
      callback: () =>
        lambdaClient.send(
          new InvokeCommand({
            FunctionName: yarnInstallFunctionName,
            Payload: JSON.stringify(payload),
            LogType: LogType.Tail,
          }),
        ),
      timeoutMs: YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS * 1000,
    });

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      throw new LogicFunctionException(
        `Yarn install Lambda failed: ${JSON.stringify(parsedResult)}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
      );
    }

    const parsedResult: YarnInstallLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.success) {
      throw new Error('Yarn install Lambda did not report success');
    }

    return parsedResult;
  }

  private async ensureBuilderLambdaExists(): Promise<void> {
    const builderFunctionName = await this.getBuilderFunctionName();
    const lambdaClient = await this.getLambdaClient();

    try {
      await lambdaClient.send(
        new GetFunctionCommand({ FunctionName: builderFunctionName }),
      );

      return;
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }

    const commonLayerArn = await this.ensureCommonLayerExists();

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await copyBuilder(sourceTemporaryDir);

      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      const params: CreateFunctionCommandInput = {
        Code: {
          ZipFile: await fs.readFile(lambdaZipPath),
        },
        FunctionName: builderFunctionName,
        Layers: [commonLayerArn],
        Handler: 'index.handler',
        Role: this.options.lambdaRole,
        Runtime: LogicFunctionRuntime.NODE22,
        Timeout: BUILDER_LAMBDA_TIMEOUT_SECONDS,
        MemorySize: BUILDER_LAMBDA_MEMORY_MB,
        EphemeralStorage: { Size: LAMBDA_EPHEMERAL_STORAGE_MB },
      };

      await lambdaClient.send(new CreateFunctionCommand(params));
    } finally {
      await temporaryDirManager.clean();
    }

    await this.waitFunctionActive(builderFunctionName);
  }

  async transpile({
    sourceCode,
    sourceFileName,
    builtFileName,
  }: LogicFunctionTranspileParams): Promise<LogicFunctionTranspileResult> {
    await this.ensureBuilderLambdaExists();

    const lambdaClient = await this.getLambdaClient();
    const builderFunctionName = await this.getBuilderFunctionName();

    const payload: BuilderLambdaPayload = {
      action: 'transpile',
      sourceCode,
      sourceFileName,
      builtFileName,
    };

    const result = await callWithTimeout({
      callback: () =>
        lambdaClient.send(
          new InvokeCommand({
            FunctionName: builderFunctionName,
            Payload: JSON.stringify(payload),
            LogType: LogType.Tail,
          }),
        ),
      timeoutMs: BUILDER_LAMBDA_TIMEOUT_SECONDS * 1000,
    });

    if (result.FunctionError) {
      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      const userCompilationErrorRegex = /^Build failed with \d+ error/;

      const isUserCompilationError =
        isNonEmptyString(parsedResult?.errorMessage) &&
        userCompilationErrorRegex.test(parsedResult.errorMessage);

      if (isUserCompilationError) {
        throw new LogicFunctionException(
          `Function code compilation failed: ${parsedResult.errorMessage}`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_COMPILATION_FAILED,
        );
      }

      throw new LogicFunctionException(
        `Builder Lambda failed: ${JSON.stringify(parsedResult)}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
      );
    }

    const parsedResult: BuilderLambdaResult = result.Payload
      ? JSON.parse(result.Payload.transformToString())
      : {};

    if (!parsedResult.builtCode) {
      throw new Error('Builder Lambda did not return builtCode');
    }

    return { builtCode: parsedResult.builtCode };
  }

  private async getExistingLayerArn(
    layerName: string,
  ): Promise<string | undefined> {
    const listLayerParams: ListLayerVersionsCommandInput = {
      LayerName: layerName,
      MaxItems: 1,
    };

    const listLayerResult = await (
      await this.getLambdaClient()
    ).send(new ListLayerVersionsCommand(listLayerParams));

    return listLayerResult.LayerVersions?.[0]?.LayerVersionArn;
  }

  private async publishLayer({
    layerName,
    zipBuffer,
  }: {
    layerName: string;
    zipBuffer: Buffer;
  }): Promise<string> {
    const result = await (
      await this.getLambdaClient()
    ).send(
      new PublishLayerVersionCommand({
        LayerName: layerName,
        Content: { ZipFile: zipBuffer },
        CompatibleRuntimes: [
          LogicFunctionRuntime.NODE18,
          LogicFunctionRuntime.NODE22,
        ],
      }),
    );

    if (!isDefined(result.LayerVersionArn)) {
      throw new Error('New layer version ARN is undefined');
    }

    return result.LayerVersionArn;
  }

  private async getDependencyContents(
    flatApplication: FlatApplication,
    applicationUniversalIdentifier: string,
  ): Promise<{ packageJson: string; yarnLock: string }> {
    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir } = await temporaryDirManager.init();

    try {
      await this.logicFunctionResourceService.copyDependenciesInMemory({
        applicationUniversalIdentifier,
        workspaceId: flatApplication.workspaceId,
        inMemoryFolderPath: sourceTemporaryDir,
      });

      const [packageJson, yarnLock] = await Promise.all([
        fs.readFile(`${sourceTemporaryDir}/package.json`, 'utf-8'),
        fs.readFile(`${sourceTemporaryDir}/yarn.lock`, 'utf-8'),
      ]);

      return { packageJson, yarnLock };
    } finally {
      await temporaryDirManager.clean();
    }
  }

  private async createLayerIfNotExist({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const layerName = this.getDepsLayerName(flatApplication);

    const existingArn = await this.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return;
    }

    const { packageJson, yarnLock } = await this.getDependencyContents(
      flatApplication,
      applicationUniversalIdentifier,
    );

    await this.ensureYarnInstallLambdaExists();

    const s3Key = `lambda-layers/${layerName}.zip`;

    const presignedUploadUrl = await this.generatePresignedUploadUrl(s3Key);

    await this.invokeYarnInstallLambda({
      action: 'createLayer',
      packageJson,
      yarnLock,
      presignedUploadUrl,
    });

    const bucket = this.options.layerBucket;

    const lambdaClient = await this.getLambdaClient();

    const publishResult = await lambdaClient.send(
      new PublishLayerVersionCommand({
        LayerName: layerName,
        Content: { S3Bucket: bucket, S3Key: s3Key },
        CompatibleRuntimes: [
          LogicFunctionRuntime.NODE18,
          LogicFunctionRuntime.NODE22,
        ],
      }),
    );

    if (!publishResult.LayerVersionArn) {
      throw new Error(
        `PublishLayerVersion did not return a LayerVersionArn for layer '${layerName}'`,
      );
    }
  }

  private async getLayerArn({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<string> {
    const layerName = this.getDepsLayerName(flatApplication);

    const existingArn = await this.getExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    await this.createLayerIfNotExist({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const newArn = await this.getExistingLayerArn(layerName);

    if (!isDefined(newArn)) {
      throw new Error(
        `Layer '${layerName}' was not created by the yarn install Lambda`,
      );
    }

    return newArn;
  }

  private async ensureSdkLayer({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<string> {
    const layerName = this.getSdkLayerName({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });

    if (!flatApplication.isSdkLayerStale) {
      const existingArn = await this.getExistingLayerArn(layerName);

      if (isDefined(existingArn)) {
        return existingArn;
      }
    }

    await this.deleteAllLayerVersions({
      lambdaClient: await this.getLambdaClient(),
      layerName,
    });

    const sdkArchiveBuffer =
      await this.sdkClientArchiveService.downloadArchiveBuffer({
        workspaceId: flatApplication.workspaceId,
        applicationId: flatApplication.id,
        applicationUniversalIdentifier,
      });

    const zipBuffer = await this.reprefixZipEntries({
      sourceBuffer: sdkArchiveBuffer,
      prefix: 'nodejs/node_modules/twenty-client-sdk',
    });

    const arn = await this.publishLayer({ layerName, zipBuffer });

    await this.sdkClientArchiveService.markSdkLayerFresh({
      applicationId: flatApplication.id,
      workspaceId: flatApplication.workspaceId,
    });

    return arn;
  }

  // Re-wraps zip entries under a new prefix path without extracting to disk.
  private async reprefixZipEntries({
    sourceBuffer,
    prefix,
  }: {
    sourceBuffer: Buffer;
    prefix: string;
  }): Promise<Buffer> {
    const { default: unzipper } = await import('unzipper');
    const archiver = (await import('archiver')).default;

    const directory = await unzipper.Open.buffer(sourceBuffer);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    for (const entry of directory.files) {
      if (entry.type === 'Directory') {
        continue;
      }

      archive.append(entry.stream(), {
        name: `${prefix}/${entry.path}`,
      });
    }

    await new Promise<void>((resolve, reject) => {
      archive.on('end', resolve);
      archive.on('error', reject);
      archive.finalize();
    });

    return Buffer.concat(chunks);
  }

  private async getLambdaExecutor(flatLogicFunction: FlatLogicFunction) {
    try {
      const getFunctionCommand: GetFunctionCommand = new GetFunctionCommand({
        FunctionName: flatLogicFunction.id,
      });

      return await (await this.getLambdaClient()).send(getFunctionCommand);
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }
  }

  async delete(flatLogicFunction: FlatLogicFunction) {
    const lambdaExecutor = await this.getLambdaExecutor(flatLogicFunction);

    if (isDefined(lambdaExecutor)) {
      const deleteFunctionCommand = new DeleteFunctionCommand({
        FunctionName: flatLogicFunction.id,
      });

      await (await this.getLambdaClient()).send(deleteFunctionCommand);
    }
  }

  private async deleteAllLayerVersions({
    lambdaClient,
    layerName,
  }: {
    lambdaClient: Lambda;
    layerName: string;
  }): Promise<void> {
    let marker: string | undefined;

    do {
      const listResult = await lambdaClient.send(
        new ListLayerVersionsCommand({
          LayerName: layerName,
          MaxItems: 50,
          Marker: marker,
        }),
      );

      const versions = listResult.LayerVersions ?? [];

      await Promise.all(
        versions.map((version) =>
          lambdaClient.send(
            new DeleteLayerVersionCommand({
              LayerName: layerName,
              VersionNumber: version.Version,
            }),
          ),
        ),
      );

      marker = listResult.NextMarker;
    } while (isDefined(marker));
  }

  private async isAlreadyBuilt({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }) {
    const lambdaExecutor = await this.getLambdaExecutor(flatLogicFunction);

    if (!isDefined(lambdaExecutor)) {
      return false;
    }

    const layers = lambdaExecutor.Configuration?.Layers;

    if (!isDefined(layers) || layers.length !== 2) {
      await this.delete(flatLogicFunction);

      return false;
    }

    const depsLayerName = this.getDepsLayerName(flatApplication);
    const sdkLayerName = this.getSdkLayerName({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier,
    });

    const hasExpectedLayers =
      layers.some((layer) => layer.Arn?.includes(depsLayerName)) &&
      layers.some((layer) => layer.Arn?.includes(sdkLayerName));

    if (hasExpectedLayers) {
      return true;
    }

    await this.delete(flatLogicFunction);

    return false;
  }

  private async build({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }) {
    const buildArgs = {
      flatLogicFunction,
      flatApplication,
      applicationUniversalIdentifier,
    };

    if (await this.canSkipBuild(buildArgs)) {
      return;
    }

    const buildLockTtlMs = 120_000;
    const buildLockRetryMs = 500;
    const buildLockMaxRetries = 240;

    await this.cacheLockService.withLock(
      async () => {
        // Need to check again inside the lock in case lock was not acquired immediately.
        if (await this.canSkipBuild(buildArgs)) {
          return;
        }

        await this.createLambdaExecutor(buildArgs);
      },
      `lambda-build:${flatLogicFunction.id}`,
      {
        ttl: buildLockTtlMs,
        ms: buildLockRetryMs,
        maxRetries: buildLockMaxRetries,
      },
    );
  }

  private async canSkipBuild({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }) {
    return (
      !flatApplication.isSdkLayerStale &&
      (await this.isAlreadyBuilt({
        flatLogicFunction,
        flatApplication,
        applicationUniversalIdentifier,
      }))
    );
  }

  private async createLambdaExecutor({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunction: FlatLogicFunction;
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }) {
    await this.delete(flatLogicFunction);

    const depsLayerArn = await this.getLayerArn({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const sdkLayerArn = await this.ensureSdkLayer({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const temporaryDirManager = new TemporaryDirManager();

    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    try {
      await copyExecutor(sourceTemporaryDir);

      await createZipFile(sourceTemporaryDir, lambdaZipPath);

      // SDK layer listed last so it overwrites the stub twenty-client-sdk
      // from the deps layer (later layers take precedence in /opt merge).
      const params: CreateFunctionCommandInput = {
        Code: {
          ZipFile: await fs.readFile(lambdaZipPath),
        },
        FunctionName: flatLogicFunction.id,
        Layers: [depsLayerArn, sdkLayerArn],
        Handler: 'index.handler',
        Role: this.options.lambdaRole,
        Runtime: flatLogicFunction.runtime,
        Timeout: 900,
        EphemeralStorage: { Size: LAMBDA_EPHEMERAL_STORAGE_MB },
      };

      const command = new CreateFunctionCommand(params);

      await (await this.getLambdaClient()).send(command);
    } finally {
      await temporaryDirManager.clean();
    }
  }

  private extractLogs(logString: string): string {
    const formattedLogString = Buffer.from(logString, 'base64')
      .toString('utf8')
      .split('\t')
      .join(' ');

    return formattedLogString
      .replace(/^(START|END|REPORT).*\n?/gm, '')
      .replace(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) [a-f0-9-]+ INFO /gm,
        '$1 INFO ',
      )
      .trim();
  }

  async execute({
    flatLogicFunction,
    flatApplication,
    applicationUniversalIdentifier,
    payload,
    env,
    timeoutMs = 900_000,
  }: LogicFunctionExecuteParams): Promise<LogicFunctionExecuteResult> {
    await this.build({
      flatLogicFunction,
      flatApplication,
      applicationUniversalIdentifier,
    });

    await this.waitFunctionActive(flatLogicFunction.id);

    const startTime = Date.now();

    const compiledCode = await this.logicFunctionResourceService.getBuiltCode({
      workspaceId: flatLogicFunction.workspaceId,
      applicationUniversalIdentifier,
      builtHandlerPath: flatLogicFunction.builtHandlerPath,
    });

    const executorPayload: LambdaDriverExecutorPayload = {
      params: payload,
      code: compiledCode,
      env: env ?? {},
      handlerName: flatLogicFunction.handlerName,
    };

    const params: InvokeCommandInput = {
      FunctionName: flatLogicFunction.id,
      Payload: JSON.stringify(executorPayload),
      LogType: LogType.Tail,
    };

    const command = new InvokeCommand(params);

    try {
      const lambdaClient = await this.getLambdaClient();

      const result = await callWithTimeout({
        callback: () => lambdaClient.send(command),
        timeoutMs,
      });

      const parsedResult = result.Payload
        ? JSON.parse(result.Payload.transformToString())
        : {};

      const logs = result.LogResult ? this.extractLogs(result.LogResult) : '';

      const duration = Date.now() - startTime;

      if (result.FunctionError) {
        return {
          data: null,
          duration,
          status: LogicFunctionExecutionStatus.ERROR,
          error: parsedResult,
          logs,
        };
      }

      return {
        data: parsedResult,
        logs,
        duration,
        status: LogicFunctionExecutionStatus.SUCCESS,
      };
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw new LogicFunctionException(
          `Function '${flatLogicFunction.id}' does not exist`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }
      throw error;
    }
  }
}
