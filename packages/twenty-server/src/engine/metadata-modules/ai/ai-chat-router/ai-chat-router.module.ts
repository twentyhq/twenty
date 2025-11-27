import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { AiToolsModule } from 'src/engine/metadata-modules/ai/ai-tools/ai-tools.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';

import { AiChatRouterService } from './ai-chat-router.service';

import { AiChatRouterPlanGeneratorService } from './services/ai-chat-router-plan-generator.service';
import { AiChatRouterStrategyDeciderService } from './services/ai-chat-router-strategy-decider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, WorkspaceEntity]),
    AiModelsModule,
    AiToolsModule,
    ObjectMetadataModule,
  ],
  providers: [
    AiChatRouterService,
    AiChatRouterStrategyDeciderService,
    AiChatRouterPlanGeneratorService,
  ],
  exports: [AiChatRouterService],
})
export class AiChatRouterModule {}
