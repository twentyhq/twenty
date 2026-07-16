import { Injectable } from '@nestjs/common';

import { postSlackMessage } from 'src/engine/core-modules/slack-assistant/utils/post-slack-message.util';

@Injectable()
export class SlackMessageSenderService {
  async postThreadReply({
    token,
    channelId,
    threadTs,
    markdownText,
  }: {
    token: string;
    channelId: string;
    threadTs: string;
    markdownText: string;
  }): Promise<void> {
    await postSlackMessage({
      token,
      channel: channelId,
      threadTs,
      markdownText,
    });
  }
}
