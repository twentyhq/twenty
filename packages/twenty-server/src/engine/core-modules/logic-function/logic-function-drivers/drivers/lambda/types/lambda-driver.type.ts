import { type LambdaClientConfig } from '@aws-sdk/client-lambda';

import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type LambdaDriverExecutorPayload = {
  code?: string;
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
  workspaceCacheService: WorkspaceCacheService;
  region: string;
  lambdaRole: string;
  subhostingRole?: string;
  layerBucket: string;
  layerBucketRegion: string;
}

export enum LambdaExecutionPhase {
  BUILD = 'build',
  FETCH_CODE = 'fetch-code',
  INVOKE = 'invoke',
}
