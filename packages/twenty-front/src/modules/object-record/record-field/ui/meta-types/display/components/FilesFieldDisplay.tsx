import { useFilesFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFilesFieldDisplay';
import { FilesDisplay } from '@/ui/field/display/components/FilesDisplay';

export const FilesFieldDisplay = () => {
  const { fieldValue } = useFilesFieldDisplay();

  if (!Array.isArray(fieldValue)) {
    return <></>;
  }

  return <FilesDisplay value={fieldValue} />;
};
