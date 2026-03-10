import * as fs from 'fs/promises';
import { join } from 'path';

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
  LogType,
  PublishLayerVersionCommand,
  type PublishLayerVersionCommandInput,
  ResourceNotFoundException,
  waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { isDefined } from 'twenty-shared/utils';

import {
  type LogicFunctionDriver,
  type LogicFunctionExecuteParams,
  type LogicFunctionExecuteResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { copyYarnEngineAndBuildDependencies } from 'src/engine/core-modules/application/application-package/utils/copy-yarn-engine-and-build-dependencies';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type GetWorkspaceGraphQLSchemaFn } from 'src/engine/core-modules/logic-function/logic-function-drivers/types/get-workspace-graphql-schema.type';
import { callWithTimeout } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/call-with-timeout';
import { copyExecutor } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/copy-executor';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { generateCoreClientInLayer } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/generate-core-client-in-layer';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS = 60;
const CREDENTIALS_DURATION_IN_SECONDS = 60 * 60; // 1h

type LambdaDriverExecutorPayload = {
  code: string;
  params: object;
  env: Record<string, string>;
  handlerName: string;
};

export interface LambdaDriverOptions extends LambdaClientConfig {
  logicFunctionResourceService: LogicFunctionResourceService;
  getWorkspaceGraphQLSchema: GetWorkspaceGraphQLSchemaFn;
  region: string;
  lambdaRole: string;
  subhostingRole?: string;
}

export class LambdaDriver implements LogicFunctionDriver {
  private lambdaClient: Lambda | undefined;
  private credentialsExpiry: Date | null = null;
  private readonly options: LambdaDriverOptions;
  private readonly logicFunctionResourceService: LogicFunctionResourceService;
  private readonly getWorkspaceGraphQLSchema: GetWorkspaceGraphQLSchemaFn;

  constructor(options: LambdaDriverOptions) {
    this.options = options;
    this.lambdaClient = undefined;
    this.logicFunctionResourceService = options.logicFunctionResourceService;
    this.getWorkspaceGraphQLSchema = options.getWorkspaceGraphQLSchema;
  }

  private async getLambdaClient() {
    if (
      !isDefined(this.lambdaClient) ||
      (isDefined(this.options.subhostingRole) &&
        isDefined(this.credentialsExpiry) &&
        new Date() >= this.credentialsExpiry)
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

  private async getAssumeRoleCredentials() {
    const stsClient = new STSClient({ region: this.options.region });

    this.credentialsExpiry = new Date(
      Date.now() + (CREDENTIALS_DURATION_IN_SECONDS - 60 * 5) * 1000,
    );

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

    return {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    };
  }

  private async waitFunctionUpdates(
    flatLogicFunction: FlatLogicFunction,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ) {
    const waitParams = {
      FunctionName: flatLogicFunction.id,
    };

    await waitUntilFunctionUpdatedV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      waitParams,
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

  private async findExistingLayerArn(
    layerName: string,
  ): Promise<string | undefined> {
    const listLayerCommand = new ListLayerVersionsCommand({
      LayerName: layerName,
      MaxItems: 1,
    });

    const listLayerResult = await (
      await this.getLambdaClient()
    ).send(listLayerCommand);

    return listLayerResult.LayerVersions?.[0]?.LayerVersionArn;
  }

  private async publishLayer({
    layerName,
    zipPath,
  }: {
    layerName: string;
    zipPath: string;
  }): Promise<string> {
    const params: PublishLayerVersionCommandInput = {
      LayerName: layerName,
      Content: {
        ZipFile: await fs.readFile(zipPath),
      },
      CompatibleRuntimes: [
        LogicFunctionRuntime.NODE18,
        LogicFunctionRuntime.NODE22,
      ],
    };

    const result = await (
      await this.getLambdaClient()
    ).send(new PublishLayerVersionCommand(params));

    if (!isDefined(result.LayerVersionArn)) {
      throw new Error('New layer version ARN is undefined');
    }

    return result.LayerVersionArn;
  }

  // Returns builtNodeModulesPath when freshly built so ensureSdkLayer
  // can copy twenty-client-sdk without a second yarn install.
  // Caller is responsible for calling cleanup.
  private async ensureDepsLayer({
    flatApplication,
    applicationUniversalIdentifier,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
  }): Promise<{
    arn: string;
    builtNodeModulesPath: string | undefined;
    cleanup: () => Promise<void>;
  }> {
    const layerName = this.getDepsLayerName(flatApplication);
    const existingArn = await this.findExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return {
        arn: existingArn,
        builtNodeModulesPath: undefined,
        cleanup: async () => {},
      };
    }

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    const nodeDependenciesFolder = join(sourceTemporaryDir, 'nodejs');

    await this.logicFunctionResourceService.copyDependenciesInMemory({
      applicationUniversalIdentifier,
      workspaceId: flatApplication.workspaceId,
      inMemoryFolderPath: nodeDependenciesFolder,
    });
    await copyYarnEngineAndBuildDependencies(nodeDependenciesFolder);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const arn = await this.publishLayer({ layerName, zipPath: lambdaZipPath });

    return {
      arn,
      builtNodeModulesPath: join(nodeDependenciesFolder, 'node_modules'),
      cleanup: () => temporaryDirManager.clean(),
    };
  }

  private async ensureSdkLayer({
    flatApplication,
    applicationUniversalIdentifier,
    stubSourcePath,
  }: {
    flatApplication: FlatApplication;
    applicationUniversalIdentifier: string;
    stubSourcePath?: string;
  }): Promise<string> {
    const layerName = this.getSdkLayerName(flatApplication.workspaceId);
    const existingArn = await this.findExistingLayerArn(layerName);

    if (isDefined(existingArn)) {
      return existingArn;
    }

    const temporaryDirManager = new TemporaryDirManager();
    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

    const nodeDependenciesFolder = join(sourceTemporaryDir, 'nodejs');

    const targetSdkPath = join(
      nodeDependenciesFolder,
      'node_modules',
      'twenty-client-sdk',
    );

    if (isDefined(stubSourcePath)) {
      await fs.cp(stubSourcePath, targetSdkPath, { recursive: true });
    } else {
      // Deps layer was a cache hit — get the stub via a fresh install.
      // This only happens when the deps layer already exists but the SDK
      // layer doesn't (e.g. new workspace on existing app dependencies).
      const installDirManager = new TemporaryDirManager();
      const { sourceTemporaryDir: installDir } = await installDirManager.init();

      const installNodejs = join(installDir, 'nodejs');

      await this.logicFunctionResourceService.copyDependenciesInMemory({
        applicationUniversalIdentifier,
        workspaceId: flatApplication.workspaceId,
        inMemoryFolderPath: installNodejs,
      });
      await copyYarnEngineAndBuildDependencies(installNodejs);

      await fs.cp(
        join(installNodejs, 'node_modules', 'twenty-client-sdk'),
        targetSdkPath,
        { recursive: true },
      );

      await installDirManager.clean();
    }

    const schema = await this.getWorkspaceGraphQLSchema(
      flatApplication.workspaceId,
    );

    await generateCoreClientInLayer({
      layerPath: nodeDependenciesFolder,
      schema,
    });

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const arn = await this.publishLayer({ layerName, zipPath: lambdaZipPath });

    await temporaryDirManager.clean();

    return arn;
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

  // We only ever publish a single layer version, but we paginate defensively
  // to handle potential duplicates from concurrent build() race conditions.
  async invalidateSdkLayer(workspaceId: string): Promise<void> {
    const layerName = this.getSdkLayerName(workspaceId);
    const lambdaClient = await this.getLambdaClient();

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

  private async isAlreadyBuilt(
    flatLogicFunction: FlatLogicFunction,
    flatApplication: FlatApplication,
  ) {
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
    const sdkLayerName = this.getSdkLayerName(flatApplication.workspaceId);

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
    if (await this.isAlreadyBuilt(flatLogicFunction, flatApplication)) {
      return;
    }

    const {
      arn: depsLayerArn,
      builtNodeModulesPath,
      cleanup: cleanupDepsLayer,
    } = await this.ensureDepsLayer({
      flatApplication,
      applicationUniversalIdentifier,
    });

    const stubSourcePath = builtNodeModulesPath
      ? join(builtNodeModulesPath, 'twenty-client-sdk')
      : undefined;

    const sdkLayerArn = await this.ensureSdkLayer({
      flatApplication,
      applicationUniversalIdentifier,
      stubSourcePath,
    });

    await cleanupDepsLayer();

    const temporaryDirManager = new TemporaryDirManager();

    const { sourceTemporaryDir, lambdaZipPath } =
      await temporaryDirManager.init();

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
    };

    const command = new CreateFunctionCommand(params);

    await (await this.getLambdaClient()).send(command);

    await temporaryDirManager.clean();
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

    await this.waitFunctionUpdates(flatLogicFunction);

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
