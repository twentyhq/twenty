import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { END_AGENT_CHAT_CHANNEL_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze-job-name.constant';
import { type EndAgentChatChannelSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze-job.types';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';

@Processor(MessageQueue.delayedJobsQueue)
export class EndAgentChatChannelSnoozeJob {
  constructor(private readonly triageService: AgentChatThreadTriageService) {}

  @Process(END_AGENT_CHAT_CHANNEL_SNOOZE_JOB_NAME)
  async handle(data: EndAgentChatChannelSnoozeJobData): Promise<void> {
    await this.triageService.endChannelSnooze(data);
  }
}
