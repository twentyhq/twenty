import { isDefined } from 'twenty-sdk/utils';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { getSlackMessageFileNames } from 'src/logic-functions/utils/get-slack-message-file-names';

export const collectSlackSharedFileNames = (
  messages: ReadonlyArray<SlackThreadMessage | undefined>,
): string[] => [
  ...new Set(
    messages
      .filter(isDefined)
      .flatMap((message) => getSlackMessageFileNames(message.files)),
  ),
];
