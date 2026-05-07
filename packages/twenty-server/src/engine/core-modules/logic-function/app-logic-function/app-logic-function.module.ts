import { Module } from '@nestjs/common';

import { AppLogicFunctionController } from 'src/engine/core-modules/logic-function/app-logic-function/app-logic-function.controller';
import { AppLogicFunctionService } from 'src/engine/core-modules/logic-function/app-logic-function/app-logic-function.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [AuthModule, WorkspaceCacheModule],
  controllers: [AppLogicFunctionController],
  providers: [AppLogicFunctionService],
})
export class AppLogicFunctionModule {}
