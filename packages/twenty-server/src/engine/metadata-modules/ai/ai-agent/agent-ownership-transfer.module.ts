import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceSuccessorModule } from 'src/engine/core-modules/user-workspace/user-workspace-successor.module';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentOwnershipTransferService } from 'src/engine/metadata-modules/ai/ai-agent/services/agent-ownership-transfer.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity]),
    UserWorkspaceSuccessorModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AgentOwnershipTransferService,
    provideWorkspaceScopedRepository(AgentEntity),
  ],
  exports: [AgentOwnershipTransferService],
})
export class AgentOwnershipTransferModule {}
