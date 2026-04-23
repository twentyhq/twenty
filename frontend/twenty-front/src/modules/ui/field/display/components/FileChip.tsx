import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { Chip, ChipVariant } from 'twenty-ui/components';

const MAX_WIDTH = 120;

const StyledClickableContainer = styled.div<{ clickable: boolean }>`
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'inherit')};
  display: inline-flex;
  min-width: 0;
`;

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

  const handleMouseDown = (event: React.MouseEvent): void => {
    if (!isClickable) {
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
    <>
      <StyledClickableContainer
        clickable={isClickable}
        onMouseDown={handleMouseDown}
      >
        <Chip
          label={file.label}
          alwaysShowTooltip={isDeleted}
          tooltipLabel={
            isDeleted ? t`File no longer exists - ${file.label}` : undefined
          }
          disabled={isDeleted}
          maxWidth={MAX_WIDTH}
          leftComponent={fileIcon}
          variant={isDeleted ? ChipVariant.Static : ChipVariant.Highlighted}
          clickable={isClickable}
        />
      </StyledClickableContainer>
    </>
  );
};
