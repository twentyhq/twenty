import { Module } from '@nestjs/common';

import { LogicFunctionPrebuiltInstallService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-install/logic-function-prebuilt-install.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [LogicFunctionPrebuiltInstallService],
  exports: [LogicFunctionPrebuiltInstallService],
})
export class LogicFunctionPrebuiltInstallModule {}
