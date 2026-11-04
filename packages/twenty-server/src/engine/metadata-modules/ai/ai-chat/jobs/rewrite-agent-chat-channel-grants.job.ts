import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job-name.constant';
import { type RewriteAgentChatChannelGrantsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job.types';
import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';

@Processor(MessageQueue.workspaceQueue)
export class RewriteAgentChatChannelGrantsJob {
  constructor(
    private readonly channelGrantService: AgentChatChannelGrantService,
  ) {}

  @Process(REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME)
  async handle({
    workspaceId,
    channelId,
  }: RewriteAgentChatChannelGrantsJobData): Promise<void> {
    if (isDefined(channelId)) {
      await this.channelGrantService.rewriteChannelGrants({
        workspaceId,
        channelId,
      });

      return;
    }

    await this.channelGrantService.rewriteAllChannelGrants({ workspaceId });
  }
}
