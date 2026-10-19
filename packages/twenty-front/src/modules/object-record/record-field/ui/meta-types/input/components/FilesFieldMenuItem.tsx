import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';
import { Chip } from 'twenty-ui/primitives/data-display';
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
          startElement={
            <FileIcon
              fileCategory={getFieldFilesValueCategory(file)}
              size="small"
              thumbnailUrl={file.url}
            />
          }
          variant="ghost"
        >
          {getChipLabel(value).content}
        </Chip>
      )}
      showPrimaryIcon={false}
      showSetAsPrimaryButton={false}
      showCopyButton={false}
    />
  );
};
