import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { isDefined } from 'twenty-shared/utils';
import {
  Chip,
  type ChipSize,
  ChipVariant,
  LinkChip,
} from 'twenty-ui/components';

const MAX_WIDTH = 120;

type FileChipProps = {
  file: FieldFilesValue;
  size?: ChipSize;
  onClick?: (file: FieldFilesValue) => void;
};

export const FileChip = ({ file, size, onClick }: FileChipProps) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(file);
  };

  const fileIcon = (
    <FileIcon
      fileCategory={
        file.fileCategory ?? getFileCategoryFromExtension(file.extension ?? '')
      }
      size="small"
    />
  );

  if (!isDefined(file.url) || !isDefined(onClick)) {
    return (
      <Chip
        label={file.label}
        size={size}
        maxWidth={MAX_WIDTH}
        leftComponent={fileIcon}
        variant={ChipVariant.Rounded}
      />
    );
  }

  return (
    <LinkChip
      to="#"
      label={file.label}
      size={size}
      maxWidth={MAX_WIDTH}
      leftComponent={fileIcon}
      variant={ChipVariant.Highlighted}
      onClick={handleClick}
      triggerEvent="CLICK"
    />
  );
};
