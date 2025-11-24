import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModelsModule } from 'src/engine/metadata-modules/ai-models/ai-models.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai-tools/ai-tools.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

import { AiRouterService } from './ai-router.service';

import { AiRouterPlanGeneratorService } from './services/ai-router-plan-generator.service';
import { AiRouterStrategyDeciderService } from './services/ai-router-strategy-decider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, WorkspaceEntity]),
    AiModelsModule,
    AiToolsModule,
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
