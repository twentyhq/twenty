import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { FILE_CATEGORIES } from 'twenty-shared/types';
import { Chip, ChipVariant } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MAX_WIDTH = 120;

const StyledClickableContainer = styled.div<{ clickable: boolean }>`
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'inherit')};
  display: inline-flex;
  min-width: 0;
`;

const StyledThumbnail = styled.img`
  border-radius: ${themeCssVariables.border.radius.sm};
  flex-shrink: 0;
  height: 16px;
  object-fit: cover;
  width: 16px;
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
  const [failedThumbnailUrl, setFailedThumbnailUrl] = useState<string>();

  const fileCategory =
    file.fileCategory ?? getFileCategoryFromExtension(file.extension ?? '');

  const label = file.label || t`Untitled file`;
  const shouldRenderThumbnail =
    !isDeleted &&
    fileCategory === FILE_CATEGORIES.IMAGE &&
    !!file.url &&
    failedThumbnailUrl !== file.url;

  const handleMouseDown = (event: React.MouseEvent): void => {
    if (!isClickable) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onClick?.(file);
  };

  const handleThumbnailError = () => {
    setFailedThumbnailUrl(file.url);
  };

  const fileIcon = <FileIcon fileCategory={fileCategory} size="small" />;

  return (
    <>
      <StyledClickableContainer
        clickable={isClickable}
        onMouseDown={handleMouseDown}
      >
        <Chip
          label={label}
          alwaysShowTooltip={isDeleted}
          tooltipLabel={
            isDeleted ? t`File no longer exists - ${label}` : undefined
          }
          disabled={isDeleted}
          maxWidth={MAX_WIDTH}
          leftComponent={
            shouldRenderThumbnail ? (
              <StyledThumbnail
                alt=""
                aria-hidden
                src={file.url}
                onError={handleThumbnailError}
              />
            ) : (
              fileIcon
            )
          }
          variant={isDeleted ? ChipVariant.Static : ChipVariant.Highlighted}
          clickable={isClickable}
        />
      </StyledClickableContainer>
    </>
  );
};
