import { type Attachment } from '@/activities/files/types/Attachment';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export type FieldFilesValueWithUrl = FieldFilesValue & {
  url: string;
};

export type AttachmentWithFile = Attachment & {
  file: [FieldFilesValueWithUrl, ...FieldFilesValueWithUrl[]];
};

export const isAttachmentWithFile = (
  attachment: Attachment,
): attachment is AttachmentWithFile => {
  return isNonEmptyArray(attachment.file) && isDefined(attachment.file[0]?.url);
};

export const filterAttachmentsWithFile = (
  attachments: Attachment[],
): AttachmentWithFile[] => {
  return attachments.filter(isAttachmentWithFile);
};
