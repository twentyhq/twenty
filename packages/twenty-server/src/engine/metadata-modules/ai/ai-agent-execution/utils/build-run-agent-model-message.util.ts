import { isNonEmptyString } from '@sniptt/guards';
import { type FilePart, type ModelMessage } from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ResolvedRunAgentAttachment } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-run-agent-attachment.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const buildRunAgentModelMessageOrThrow = ({
  message,
  attachmentsByFileId,
}: {
  message: RunAgentMessage;
  attachmentsByFileId: Map<string, ResolvedRunAgentAttachment>;
}): ModelMessage => {
  const attachments = message.attachments ?? [];

  if (!isNonEmptyArray(attachments)) {
    return { role: message.role, content: message.content };
  }

  const fileParts = attachments.map((attachment): FilePart => {
    const resolvedAttachment = attachmentsByFileId.get(attachment.fileId);

    if (!isDefined(resolvedAttachment)) {
      throw new AiException(
        `Attachment ${attachment.fileId} is not an uploaded ${FileFolder.AgentChat} file in this workspace`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return {
      type: 'file',
      data: resolvedAttachment.url,
      mediaType: resolvedAttachment.mediaType,
      filename: attachment.filename,
    };
  });

  return {
    role: 'user',
    content: [
      ...(isNonEmptyString(message.content)
        ? [{ type: 'text' as const, text: message.content }]
        : []),
      ...fileParts,
    ],
  };
};
