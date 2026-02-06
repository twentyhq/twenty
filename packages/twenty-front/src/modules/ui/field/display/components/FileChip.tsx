import styled from '@emotion/styled';

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
  const isClickable = forceDisableClick !== true;

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
    <StyledClickableContainer
      clickable={isClickable}
      onMouseDown={handleMouseDown}
    >
      <Chip
        label={file.label ?? ''}
        maxWidth={MAX_WIDTH}
        leftComponent={fileIcon}
        variant={ChipVariant.Highlighted}
        clickable={isClickable}
      />
    </StyledClickableContainer>
  );
};
