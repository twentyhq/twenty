import { isNonEmptyString } from '@sniptt/guards';
import { type FilePart, type ModelMessage, type TextPart } from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ResolvedRunAgentAttachment } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-run-agent-attachment.type';
import { getNativeMimeTypesForModalities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-mime-types-for-modalities.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const DEFAULT_ATTACHMENT_FILENAME = 'uploaded_file';

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
      const filename = isNonEmptyString(attachment.filename)
        ? attachment.filename
        : DEFAULT_ATTACHMENT_FILENAME;
      const mediaType = isNonEmptyString(resolvedAttachment.mediaType)
        ? resolvedAttachment.mediaType
        : 'unknown';

      return {
        type: 'text',
        text: `[Attached file: ${filename} (type: ${mediaType}) — file type is not supported for direct analysis]`,
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
