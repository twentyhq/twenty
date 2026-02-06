import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

export const uploadMultipleFiles = async (
  files: File[],
  fieldMetadataId: string,
  uploadFile: (
    file: File,
    fieldMetadataId: string,
  ) => Promise<FieldFilesValue | undefined>,
): Promise<FieldFilesValue[]> => {
  const uploadedFiles: FieldFilesValue[] = [];

  for (const file of files) {
    const uploadedFile = await uploadFile(file, fieldMetadataId);
    if (isDefined(uploadedFile)) {
      uploadedFiles.push(uploadedFile);
    }
  }

  return uploadedFiles;
};
