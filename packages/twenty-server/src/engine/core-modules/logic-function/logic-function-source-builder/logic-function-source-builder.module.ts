import { Module } from '@nestjs/common';

import { LogicFunctionSourceBuilderService } from './logic-function-source-builder.service';

@Module({
  providers: [LogicFunctionSourceBuilderService],
  exports: [LogicFunctionSourceBuilderService],
})
export class LogicFunctionSourceBuilderModule {}
