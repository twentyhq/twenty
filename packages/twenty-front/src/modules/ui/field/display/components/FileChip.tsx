import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant, LinkChip } from 'twenty-ui/components';

const MAX_WIDTH = 120;

type FileChipProps = {
  file: FieldFilesValue;
  onClick: (file: FieldFilesValue) => void;
  forceDisableClick?: boolean;
};

export const FileChip = ({
  file,
  onClick,
  forceDisableClick,
}: FileChipProps) => {
  const handleClick = (event: React.MouseEvent): void => {
    if (isDefined(forceDisableClick)) {
      return;
    }
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

  return (
    <LinkChip
      to="#"
      label={file.label}
      maxWidth={MAX_WIDTH}
      leftComponent={fileIcon}
      variant={ChipVariant.Highlighted}
      onClick={forceDisableClick ? undefined : handleClick}
      triggerEvent="CLICK"
    />
  );
};
