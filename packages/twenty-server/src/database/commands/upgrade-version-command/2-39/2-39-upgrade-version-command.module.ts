import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ConvertLogicFunctionsToPrebuiltCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788338950836-convert-logic-functions-to-prebuilt.command';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';

@Module({
  imports: [FeatureFlagModule, LogicFunctionModule, WorkspaceIteratorModule],
  providers: [ConvertLogicFunctionsToPrebuiltCommand],
})
export class V2_39_UpgradeVersionCommandModule {}
