import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { AppLogicFunctionController } from 'src/engine/core-modules/logic-function/app-logic-function/app-logic-function.controller';
import { AppLogicFunctionService } from 'src/engine/core-modules/logic-function/app-logic-function/app-logic-function.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [TokenModule, WorkspaceCacheModule, WorkspaceCacheStorageModule],
  controllers: [AppLogicFunctionController],
  providers: [AppLogicFunctionService],
})
export class AppLogicFunctionModule {}
