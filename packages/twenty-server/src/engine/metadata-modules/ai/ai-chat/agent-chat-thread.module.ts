import { Module } from '@nestjs/common';

import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { EndAgentChatThreadSnoozeJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze.job';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// separate from AiChatModule so workflow actions can message members' chats
// without its streaming, tool and workflow dependencies
@Module({
  imports: [
    AgentChatThreadLifecycleModule,
    AgentHistoryModule,
    PermissionsModule,
    RecordShareStorageModule,
    UserWorkspaceModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AgentChatSharingService,
    AgentChatThreadParticipantEventService,
    AgentChatThreadParticipantService,
    AgentChatThreadService,
    AgentInboxService,
    EndAgentChatThreadSnoozeJob,
  ],
  exports: [
    AgentChatSharingService,
    AgentChatThreadParticipantService,
    AgentChatThreadService,
    AgentInboxService,
  ],
})
export class AgentChatThreadModule {}
