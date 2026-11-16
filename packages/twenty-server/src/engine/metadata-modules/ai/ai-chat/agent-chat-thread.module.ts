import { AgentChatInboxParticipantWriterService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-participant-writer.service';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatAssistantParticipationService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-participation.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { RecordShareModule } from 'src/engine/permissions/record-share/record-share.module';
import { PrivateRecordModule } from 'src/engine/permissions/private-record/private-record.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { EndAgentChatChannelSnoozeJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze.job';
import { EndAgentChatThreadSnoozeJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze.job';
import { RewriteAgentChatChannelGrantsJob } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants.job';
import { AgentChatChannelRoleAccessListener } from 'src/engine/metadata-modules/ai/ai-chat/listeners/agent-chat-channel-role-access.listener';
import { AgentChatAssistantPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-policy.service';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AgentChatChannelThreadsService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-threads.service';
import { AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { AgentChatChannelModule } from 'src/engine/metadata-modules/agent-chat-channel/agent-chat-channel.module';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// separate from AiChatModule so workflow actions can message members' chats
// without its streaming, tool and workflow dependencies
@Module({
  imports: [
    AgentChatChannelModule,
    AgentChatThreadLifecycleModule,
    AgentHistoryModule,
    CoreEntityCacheModule,
    PermissionsModule,
    RecordShareModule,
    PrivateRecordModule,
    TypeORMModule,
    TypeOrmModule.forFeature([
      UserWorkspaceEntity,
      AgentChatChannelEntity,
      AgentChatChannelRoleEntity,
      RoleEntity,
    ]),
    UserWorkspaceModule,
    WorkspaceCacheModule,
  ],
  providers: [
    AgentChatAssistantParticipationService,
    AgentChatInboxDeliveryService,
    AgentChatInboxParticipantWriterService,

    AgentChatAssistantPolicyService,
    AgentChatChannelAccessService,
    AgentChatChannelRoleAccessListener,
    AgentChatChannelGrantService,
    AgentChatChannelService,
    AgentChatChannelThreadsService,
    AgentChatDirectMessageIdentityService,
    AgentChatSharingService,
    AgentChatThreadParticipantEventService,
    AgentChatThreadParticipantService,
    AgentChatThreadService,
    AgentChatThreadTriageService,
    AgentInboxService,
    EndAgentChatChannelSnoozeJob,
    EndAgentChatThreadSnoozeJob,
    RewriteAgentChatChannelGrantsJob,
    provideWorkspaceScopedRepository(AgentChatChannelEntity),
    provideWorkspaceScopedRepository(AgentChatChannelRoleEntity),
    provideWorkspaceScopedRepository(RoleEntity),
  ],
  exports: [
    AgentChatAssistantParticipationService,
    AgentChatInboxDeliveryService,
    AgentChatAssistantPolicyService,
    AgentChatChannelGrantService,
    AgentChatChannelService,
    AgentChatChannelThreadsService,
    AgentChatDirectMessageIdentityService,
    AgentChatSharingService,
    AgentChatThreadParticipantService,
    AgentChatThreadService,
    AgentChatThreadTriageService,
    AgentInboxService,
  ],
})
export class AgentChatThreadModule {}
