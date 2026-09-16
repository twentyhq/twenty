import { type RunAgentMessage } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/max-run-agent-attachment-filename-length.const';
import { MAX_RUN_AGENT_MESSAGE_ATTACHMENTS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/max-run-agent-message-attachments.const';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const extractRunAgentAttachmentFileIdsOrThrow = (
  messages: RunAgentMessage[],
): string[] => {
  for (const message of messages) {
    const attachments = message.attachments ?? [];

    if (message.role !== 'user' && isNonEmptyArray(attachments)) {
      throw new AiException(
        'Only user messages can carry attachments',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    if (attachments.length > MAX_RUN_AGENT_MESSAGE_ATTACHMENTS) {
      throw new AiException(
        `A message carries ${attachments.length} attachments, more than the ${MAX_RUN_AGENT_MESSAGE_ATTACHMENTS} allowed`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const overlongFilename = attachments.find(
      (attachment) =>
        (attachment.filename?.length ?? 0) >
        MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH,
    );

    if (isDefined(overlongFilename)) {
      throw new AiException(
        `An attachment filename is longer than the ${MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH} characters allowed`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }
  }

  return [
    ...new Set(
      messages.flatMap((message) =>
        (message.attachments ?? []).map((attachment) => attachment.fileId),
      ),
    ),
  ];
};
