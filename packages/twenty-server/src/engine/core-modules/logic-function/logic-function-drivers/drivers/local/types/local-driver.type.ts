import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type LocalDriverOptions = {
  logicFunctionResourceService: LogicFunctionResourceService;
  sdkClientArchiveService: SdkClientArchiveService;
  cacheLockService: CacheLockService;
  workspaceCacheService: WorkspaceCacheService;
};

export type ChildProcessRunnerResult = {
  ok: boolean;
  result?: unknown;
  error?: string;
  stack?: string;
  stdout: string;
  stderr: string;
};
