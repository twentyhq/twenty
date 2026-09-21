import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_ATTACHMENT_MIME_TYPES } from 'src/logic-functions/constants/slack-assistant-attachment-mime-types';
import { SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES } from 'src/logic-functions/constants/slack-assistant-max-attachment-size-bytes';
import { type SlackAttachmentCandidate } from 'src/logic-functions/types/slack-attachment-candidate.type';
import { type SlackMessageFile } from 'src/logic-functions/types/slack-message-file.type';

export const isSlackAttachmentCandidate = (
  file: SlackMessageFile,
): file is SlackAttachmentCandidate => {
  if (!isNonEmptyString(file.url_private) || !isNonEmptyString(file.mimetype)) {
    return false;
  }

  if (!SLACK_ASSISTANT_ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
    return false;
  }

  return (
    !isDefined(file.size) ||
    file.size <= SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES
  );
};
