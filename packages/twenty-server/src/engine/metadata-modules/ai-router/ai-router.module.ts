import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

import { AiRouterService } from './ai-router.service';
import { AiRouterPlanGeneratorService } from './services/ai-router-plan-generator.service';
import { AiRouterStrategyDeciderService } from './services/ai-router-strategy-decider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, WorkspaceEntity]),
    AiModule,
    ObjectMetadataModule,
  ],
  providers: [
    AiRouterService,
    AiRouterStrategyDeciderService,
    AiRouterPlanGeneratorService,
  ],
  exports: [AiRouterService],
})
export class AiRouterModule {}
