import { isNonEmptyArray } from '@sniptt/guards';

import { type SlackMessageBody } from 'src/logic-functions/types/slack-message-body.type';

export const getSlackMessageBodyFallbacks = ({
  messageFormat,
  messageBlocks,
}: SlackMessageBody): SlackMessageBody[] => {
  if (isNonEmptyArray(messageBlocks)) {
    return [{ messageFormat: 'markdown' }, { messageFormat: 'plain' }];
  }

  if (messageFormat === 'markdown') {
    return [{ messageFormat: 'plain' }];
  }

  return [];
};
