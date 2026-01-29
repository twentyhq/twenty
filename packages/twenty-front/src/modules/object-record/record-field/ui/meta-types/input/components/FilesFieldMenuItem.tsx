import { type FieldFileValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Chip, ChipVariant } from 'twenty-ui/components';
import { MultiItemFieldMenuItem } from './MultiItemFieldMenuItem';

type FilesFieldMenuItemProps = {
  dropdownId: string;
  onEdit?: () => void;
  onSetAsPrimary?: () => void;
  onDelete?: () => void;
  onCopy?: (file: FieldFileValue) => void;
  file: FieldFileValue;
  showPrimaryIcon: boolean;
  showSetAsPrimaryButton: boolean;
  showCopyButton: boolean;
};

const FileDisplay = ({ value }: { value: FieldFileValue }) => {
  return (
    <Chip
      variant={ChipVariant.Highlighted}
      label={value.label}
      emptyLabel="Untitled"
    />
  );
};

export const FilesFieldMenuItem = ({
  dropdownId,
  onEdit,
  onSetAsPrimary,
  onDelete,
  file,
  showPrimaryIcon,
  showSetAsPrimaryButton,
  showCopyButton,
  onCopy,
}: FilesFieldMenuItemProps) => {
  return (
    <MultiItemFieldMenuItem
      dropdownId={dropdownId}
      value={file}
      onEdit={onEdit}
      onSetAsPrimary={onSetAsPrimary}
      onDelete={onDelete}
      DisplayComponent={FileDisplay}
      showPrimaryIcon={showPrimaryIcon}
      showSetAsPrimaryButton={showSetAsPrimaryButton}
      showCopyButton={showCopyButton}
      onCopy={onCopy}
    />
  );
};
