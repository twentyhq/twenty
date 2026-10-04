import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job-name.constant';
import { type EndAgentChatThreadSnoozeJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job.types';
import { AgentChatThreadParticipantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';

@Processor(MessageQueue.delayedJobsQueue)
export class EndAgentChatThreadSnoozeJob {
  constructor(
    private readonly participantService: AgentChatThreadParticipantService,
  ) {}

  @Process(END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME)
  async handle(data: EndAgentChatThreadSnoozeJobData): Promise<void> {
    await this.participantService.endSnooze(data);
  }
}
