import { isNonEmptyString } from '@sniptt/guards';
import { FILE_CATEGORIES } from 'twenty-shared/types';

import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';

type ChatMessageAttachmentGroups = {
  gridImages: FieldFilesValue[];
  standaloneAttachments: FieldFilesValue[];
};

export const getChatMessageAttachmentGroups = (
  attachments: FieldFilesValue[],
): ChatMessageAttachmentGroups => {
  const images = attachments.filter(
    (attachment) =>
      isNonEmptyString(attachment.url) &&
      attachment.isDeleted !== true &&
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
