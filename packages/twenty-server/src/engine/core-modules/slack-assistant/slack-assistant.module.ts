import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationConnectionsModule } from 'src/engine/core-modules/application/connection-provider/connections/application-connections.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { SlackAssistantController } from 'src/engine/core-modules/slack-assistant/controllers/slack-assistant.controller';
import { SlackAssistantReplyJob } from 'src/engine/core-modules/slack-assistant/jobs/slack-assistant-reply.job';
import { SlackAssistantRoleAssignmentJob } from 'src/engine/core-modules/slack-assistant/jobs/slack-assistant-role-assignment.job';
import { SlackAssistantAgentCreatedListener } from 'src/engine/core-modules/slack-assistant/listeners/slack-assistant-agent-created.listener';
import { SlackApplicationResolverService } from 'src/engine/core-modules/slack-assistant/services/slack-application-resolver.service';
import { SlackAssistantConfigService } from 'src/engine/core-modules/slack-assistant/services/slack-assistant-config.service';
import { SlackAssistantService } from 'src/engine/core-modules/slack-assistant/services/slack-assistant.service';
import { SlackConnectionService } from 'src/engine/core-modules/slack-assistant/services/slack-connection.service';
import { SlackSignatureVerifierService } from 'src/engine/core-modules/slack-assistant/services/slack-signature-verifier.service';
import { SlackThreadSubscriptionService } from 'src/engine/core-modules/slack-assistant/services/slack-thread-subscription.service';
import { SlackWorkspaceResolverService } from 'src/engine/core-modules/slack-assistant/services/slack-workspace-resolver.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AiAgentRoleModule } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.module';
import { AiAgentModule } from 'src/engine/metadata-modules/ai/ai-agent/ai-agent.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationRegistrationVariableEntity,
      WorkspaceEntity,
    ]),
    SecretEncryptionModule,
    ApplicationModule,
    ApplicationConnectionsModule,
    AiAgentModule,
    AiAgentExecutionModule,
    AiAgentRoleModule,
  ],
  controllers: [SlackAssistantController],
  providers: [
    SlackAssistantConfigService,
    SlackSignatureVerifierService,
    SlackApplicationResolverService,
    SlackConnectionService,
    SlackWorkspaceResolverService,
    SlackThreadSubscriptionService,
    SlackAssistantService,
    SlackAssistantReplyJob,
    SlackAssistantRoleAssignmentJob,
    SlackAssistantAgentCreatedListener,
  ],
})
export class SlackAssistantModule {}
