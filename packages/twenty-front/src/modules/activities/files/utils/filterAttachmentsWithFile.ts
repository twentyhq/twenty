import { type Attachment } from '@/activities/files/types/Attachment';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyArray } from 'twenty-shared/utils';

export type AttachmentWithFile = Attachment & {
  file: [FieldFilesValue, ...FieldFilesValue[]];
};

export const isAttachmentWithFile = (
  attachment: Attachment,
): attachment is AttachmentWithFile => {
  return isNonEmptyArray(attachment.file);
};

export const filterAttachmentsWithFile = (
  attachments: Attachment[],
): AttachmentWithFile[] => {
  return attachments.filter(isAttachmentWithFile);
};
