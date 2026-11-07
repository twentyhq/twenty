import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
  ],
  providers: [AgentChatChannelMetadataService],
  exports: [AgentChatChannelMetadataService],
})
export class AgentChatChannelModule {}
