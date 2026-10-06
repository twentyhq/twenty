import { Module } from '@nestjs/common';

import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { EndAgentChatChannelSnoozeJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze.job';
import { EndAgentChatThreadSnoozeJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze.job';
import { AgentChatChannelRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-record-event.service';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AgentChatInboxViewService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-view.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
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
    RecordShareModule,
    RecordShareStorageModule,
    UserWorkspaceModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AgentChatChannelRecordEventService,
    AgentChatChannelService,
    AgentChatInboxViewService,
    AgentChatSharingService,
    AgentChatThreadParticipantEventService,
    AgentChatThreadParticipantService,
    AgentChatThreadService,
    AgentChatThreadTriageService,
    AgentInboxService,
    EndAgentChatChannelSnoozeJob,
    EndAgentChatThreadSnoozeJob,
  ],
  exports: [
    AgentChatChannelService,
    AgentChatInboxViewService,
    AgentChatSharingService,
    AgentChatThreadParticipantService,
    AgentChatThreadService,
    AgentChatThreadTriageService,
    AgentInboxService,
  ],
})
export class AgentChatThreadModule {}
