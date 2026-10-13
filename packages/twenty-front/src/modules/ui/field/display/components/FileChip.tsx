import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { Chip } from 'twenty-ui/primitives/data-display';

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
  const isDeleted = file.isDeleted === true;
  const isClickable = forceDisableClick !== true && !isDeleted;

  const fileCategory =
    file.fileCategory ?? getFileCategoryFromExtension(file.extension ?? '');

  const label = isNonEmptyString(file.label) ? file.label : t`Untitled file`;

  const handleMouseDown = (event: React.MouseEvent): void => {
    if (!isClickable) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onClick?.(file);
  };

  const handleClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    if (isClickable && event.detail === 0) {
      onClick(file);
    }
  };

  return (
    <Chip
      render={
        forceDisableClick ? undefined : (
          <button type="button" disabled={isDeleted} />
        )
      }
      onMouseDown={handleMouseDown}
      onClick={isClickable ? handleClick : undefined}
      alwaysShowTooltip={isDeleted}
      tooltipContent={
        isDeleted ? t`File no longer exists - ${label}` : undefined
      }
      aria-disabled={isDeleted || undefined}
      maxWidth={MAX_WIDTH}
      startElement={
        <FileIcon
          fileCategory={fileCategory}
          size="small"
          thumbnailUrl={isDeleted ? undefined : file.url}
        />
      }
      variant="soft"
      clickable={isClickable}
    >
      {label}
    </Chip>
  );
};
