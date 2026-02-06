import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { Chip, ChipVariant } from 'twenty-ui/components';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type FilesFieldMenuItemProps = {
  dropdownId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  file: FieldFilesValue;
};

export const FilesFieldMenuItem = ({
  dropdownId,
  onEdit,
  onDelete,
  onClick,
  file,
}: FilesFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      value={file.label}
      onEdit={onEdit}
      onDelete={onDelete}
      onClick={onClick}
      DisplayComponent={({ value }: { value: string }) => (
        <Chip
          label={value}
          leftComponent={
            <FileIcon
              fileCategory={
                file.fileCategory ??
                getFileCategoryFromExtension(file.extension ?? '')
              }
              size="small"
            />
          }
          variant={ChipVariant.Rounded}
        />
      )}
      showPrimaryIcon={false}
      showSetAsPrimaryButton={false}
      showCopyButton={false}
    />
  );
};
