import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { type SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export interface LocalDriverOptions {
  logicFunctionResourceService: LogicFunctionResourceService;
  sdkClientArchiveService: SdkClientArchiveService;
  cacheLockService: CacheLockService;
  workspaceCacheService: WorkspaceCacheService;
  secureHttpClientService: SecureHttpClientService;
  restrictNetwork: boolean;
}
