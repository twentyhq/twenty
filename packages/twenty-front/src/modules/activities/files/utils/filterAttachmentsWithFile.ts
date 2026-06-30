import { type Attachment } from '@/activities/files/types/Attachment';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export type FieldFilesValueWithUrl = FieldFilesValue & {
  url: string;
};

type AttachmentWithFiles = Attachment & {
  file: [FieldFilesValueWithUrl, ...FieldFilesValueWithUrl[]];
};

export type AttachmentWithFile = Omit<Attachment, 'file'> & {
  file: FieldFilesValueWithUrl;
};

const hasFileWithUrl = (
  attachment: Attachment,
): attachment is AttachmentWithFiles => {
  return isNonEmptyArray(attachment.file) && isDefined(attachment.file[0].url);
};

const normalizeAttachment = (
  attachment: AttachmentWithFiles,
): AttachmentWithFile => ({
  ...attachment,
  file: attachment.file[0],
});

export const filterAttachmentsWithFile = (
  attachments: Attachment[],
): AttachmentWithFile[] => {
  return attachments.filter(hasFileWithUrl).map(normalizeAttachment);
};
