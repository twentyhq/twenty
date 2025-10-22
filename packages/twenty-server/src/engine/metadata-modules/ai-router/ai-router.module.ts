import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

import { AiRouterService } from './ai-router.service';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity, WorkspaceEntity]), AiModule],
  providers: [AiRouterService],
  exports: [AiRouterService],
})
export class AiRouterModule {}
