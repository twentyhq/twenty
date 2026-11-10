import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedFileUIPart } from 'twenty-shared/ai';
import { FILE_CATEGORIES } from 'twenty-shared/types';

import { getAgentChatFilePartFieldFilesValue } from '@/ai/utils/getAgentChatFilePartFieldFilesValue';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';

type AgentChatAttachmentGroups = {
  gridImages: FieldFilesValue[];
  standaloneAttachments: FieldFilesValue[];
};

export const getAgentChatAttachmentGroups = (
  fileParts: ExtendedFileUIPart[],
): AgentChatAttachmentGroups => {
  const attachments = fileParts.map(getAgentChatFilePartFieldFilesValue);
  const images = attachments.filter(
    (attachment) =>
      isNonEmptyString(attachment.url) &&
      getFieldFilesValueCategory(attachment) === FILE_CATEGORIES.IMAGE,
  );

  if (images.length < 2) {
    return { gridImages: [], standaloneAttachments: attachments };
  }

  return {
    gridImages: images,
    standaloneAttachments: attachments.filter(
      (attachment) => !images.includes(attachment),
    ),
  };
};
