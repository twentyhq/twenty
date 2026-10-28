import { Injectable } from '@nestjs/common';

import {
  type LogicFunctionDriver,
  LogicFunctionDriverType,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

import { ApplicationDependencyFilesService } from 'src/engine/core-modules/application/application-package/application-dependency-files.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { DisabledDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/disabled.driver';
import { LambdaDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class LogicFunctionDriverFactory extends DriverFactoryBase<LogicFunctionDriver> {
  constructor(
    twentyConfigService: TwentyConfigService,
    configGroupHashService: ConfigGroupHashService,
    private readonly logicFunctionResourceService: LogicFunctionResourceService,
    private readonly applicationDependencyFilesService: ApplicationDependencyFilesService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {
    super(twentyConfigService, configGroupHashService);
  }

  protected buildConfigKey(): string {
    const driverType = this.twentyConfigService.get('LOGIC_FUNCTION_TYPE');

    if (driverType === LogicFunctionDriverType.LAMBDA) {
      return `lambda|${this.configGroupHashService.computeHash(ConfigVariablesGroup.LOGIC_FUNCTION_CONFIG)}`;
    }

    return driverType;
  }

  protected createDriver(): LogicFunctionDriver {
    const driverType = this.twentyConfigService.get('LOGIC_FUNCTION_TYPE');

    switch (driverType) {
      case LogicFunctionDriverType.DISABLED:
        return new DisabledDriver();

      case LogicFunctionDriverType.LOCAL:
        return new LocalDriver({
          logicFunctionResourceService: this.logicFunctionResourceService,
          sdkClientArchiveService: this.sdkClientArchiveService,
          cacheLockService: this.cacheLockService,
          workspaceCacheService: this.workspaceCacheService,
        });

      case LogicFunctionDriverType.LAMBDA: {
        return new LambdaDriver({
          logicFunctionResourceService: this.logicFunctionResourceService,
          applicationDependencyFilesService:
            this.applicationDependencyFilesService,
          cacheLockService: this.cacheLockService,
          cacheStorageService: this.cacheStorageService,
          workspaceCacheService: this.workspaceCacheService,
          ...getLambdaConnectionOptions(this.twentyConfigService),
          sdkClientArchiveService: this.sdkClientArchiveService,
        });
      }

      default:
        throw new Error(
          `Invalid logic function driver type (${driverType}), check your .env file`,
        );
    }
  }
}
