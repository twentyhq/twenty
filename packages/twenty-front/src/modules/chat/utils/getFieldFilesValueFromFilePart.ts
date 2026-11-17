import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ExtendedFileUIPart } from 'twenty-shared/ai';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

export const getFieldFilesValueFromFilePart = (
  filePart: ExtendedFileUIPart,
): FieldFilesValue => {
  const label = filePart.filename ?? '';

  return {
    fileId: filePart.fileId,
    label,
    extension: getFileNameAndExtension(label).extension,
    url: filePart.url,
  };
};
