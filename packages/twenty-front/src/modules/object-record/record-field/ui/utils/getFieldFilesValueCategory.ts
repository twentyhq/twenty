import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';

export const getFieldFilesValueCategory = ({
  fileCategory,
  extension,
}: Pick<FieldFilesValue, 'fileCategory' | 'extension'>) =>
  fileCategory ?? getFileCategoryFromExtension(extension ?? '');
