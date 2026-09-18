import { isNonEmptyString } from '@sniptt/guards';
import { type FilePart, type ModelMessage, type TextPart } from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ResolvedRunAgentAttachment } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-run-agent-attachment.type';
import { formatUnsupportedFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-models/utils/format-unsupported-file-placeholder.util';
import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-mime-types-for-modalities.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const buildRunAgentModelMessageOrThrow = ({
  message,
  attachmentsByFileId,
  modalities,
}: {
  message: RunAgentMessage;
  attachmentsByFileId: Map<string, ResolvedRunAgentAttachment>;
  modalities: string[] | undefined;
}): ModelMessage => {
  const attachments = message.attachments ?? [];

  if (!isNonEmptyArray(attachments)) {
    return { role: message.role, content: message.content };
  }

  const supportedMediaTypes = getNativeMimeTypesForModalities(modalities);

  const attachmentParts = attachments.map((attachment): FilePart | TextPart => {
    const resolvedAttachment = attachmentsByFileId.get(attachment.fileId);

    if (!isDefined(resolvedAttachment)) {
      throw new AiException(
        `Attachment ${attachment.fileId} is not an uploaded ${FileFolder.AgentChat} file in this workspace`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    if (!supportedMediaTypes.has(resolvedAttachment.mediaType)) {
      return {
        type: 'text',
        text: formatUnsupportedFilePlaceholder({
          filename: attachment.filename,
          mediaType: resolvedAttachment.mediaType,
        }),
      };
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
      ...attachmentParts,
    ],
  };
};
