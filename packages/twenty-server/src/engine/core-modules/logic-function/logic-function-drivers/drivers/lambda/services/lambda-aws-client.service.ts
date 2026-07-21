import {
  Lambda,
  ListLayerVersionsCommand,
  waitUntilFunctionActiveV2,
  waitUntilFunctionUpdatedV2,
} from '@aws-sdk/client-lambda';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isDefined } from 'twenty-shared/utils';

import {
  CREDENTIALS_DURATION_IN_SECONDS,
  LAMBDA_CLIENT_MAX_ATTEMPTS,
  LAMBDA_CLIENT_RETRY_MODE,
  UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type LambdaDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';

export class LambdaAwsClientService {
  private lambdaClient: Lambda | undefined;
  private assumeRoleCredentials:
    | { accessKeyId: string; secretAccessKey: string; sessionToken: string }
    | undefined;
  private credentialsExpiry: Date | null = null;

  constructor(private readonly options: LambdaDriverOptions) {}

  async getLambdaClient() {
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
        maxAttempts: LAMBDA_CLIENT_MAX_ATTEMPTS,
        retryMode: LAMBDA_CLIENT_RETRY_MODE,
      });
    }

    return this.lambdaClient;
  }

  async generatePresignedUploadUrl(
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

  async waitFunctionActive(
    functionName: string,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ): Promise<void> {
    await waitUntilFunctionActiveV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      { FunctionName: functionName },
    );
  }

  async waitFunctionUpdated(
    functionName: string,
    maxWaitTime: number = UPDATE_FUNCTION_DURATION_TIMEOUT_IN_SECONDS,
  ): Promise<void> {
    await waitUntilFunctionUpdatedV2(
      { client: await this.getLambdaClient(), maxWaitTime },
      { FunctionName: functionName },
    );
  }

  async getExistingLayerArn(layerName: string): Promise<string | undefined> {
    const lambdaClient = await this.getLambdaClient();

    const listLayerResult = await lambdaClient.send(
      new ListLayerVersionsCommand({
        LayerName: layerName,
        MaxItems: 1,
      }),
    );

    return listLayerResult.LayerVersions?.[0]?.LayerVersionArn;
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
}
