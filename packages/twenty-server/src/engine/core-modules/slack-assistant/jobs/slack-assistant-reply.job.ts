import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SLACK_ASSISTANT_REPLY_JOB_NAME } from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';
import { SlackAssistantService } from 'src/engine/core-modules/slack-assistant/services/slack-assistant.service';
import { SlackWorkspaceResolverService } from 'src/engine/core-modules/slack-assistant/services/slack-workspace-resolver.service';
import { type SlackAssistantReplyJobData } from 'src/engine/core-modules/slack-assistant/types/slack-assistant-reply-job.type';

const MESSAGE_DEDUPE_TTL_SECONDS = 5 * 60;

@Processor({ queueName: MessageQueue.aiQueue })
export class SlackAssistantReplyJob {
  private readonly logger = new Logger(SlackAssistantReplyJob.name);

  constructor(
    private readonly slackWorkspaceResolverService: SlackWorkspaceResolverService,
    private readonly slackAssistantService: SlackAssistantService,
    private readonly redisClientService: RedisClientService,
  ) {}

  @Process(SLACK_ASSISTANT_REPLY_JOB_NAME)
  async handle(data: SlackAssistantReplyJobData): Promise<void> {
    if (await this.isDuplicateMessage(data)) {
      return;
    }

    const workspaceId =
      await this.slackWorkspaceResolverService.resolveWorkspaceId({
        teamId: data.teamId,
        enterpriseId: data.enterpriseId,
      });

    if (!isDefined(workspaceId)) {
      return;
    }

    await this.slackAssistantService.answerInThread({
      workspaceId,
      teamId: data.teamId,
      channelId: data.channelId,
      threadTs: data.threadTs,
      ts: data.ts,
      text: data.text,
    });
  }

  private async isDuplicateMessage(
    data: SlackAssistantReplyJobData,
  ): Promise<boolean> {
    const claim = await this.redisClientService
      .getClient()
      .set(
        `slack-assistant:message:${data.teamId}:${data.channelId}:${data.ts}`,
        '1',
        'EX',
        MESSAGE_DEDUPE_TTL_SECONDS,
        'NX',
      );

    if (claim !== 'OK') {
      this.logger.log(
        `Skipping duplicate Slack message ${data.ts} in ${data.channelId}.`,
      );

      return true;
    }

    return false;
  }
}
