import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId, useState } from 'react';
import { createPortal } from 'react-dom';

import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { Chip, ChipVariant } from 'twenty-ui/components';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MAX_WIDTH = 120;

const StyledClickableContainer = styled.div<{
  clickable: boolean;
  isDeleted: boolean;
}>`
  cursor: ${({ clickable, isDeleted }) =>
    isDeleted ? 'not-allowed' : clickable ? 'pointer' : 'inherit'};
  display: inline-flex;
  min-width: 0;
`;

const StyledDeletedLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: inherit;
  max-width: ${MAX_WIDTH}px;
  overflow: hidden;
  text-decoration: line-through;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  const tooltipAnchorId = useId();
  const tooltipAnchorSelect = `[data-tooltip-anchor="${tooltipAnchorId}"]`;
  const [shouldShowTooltip, setShouldShowTooltip] = useState(false);

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
        data-tooltip-anchor={tooltipAnchorId}
        clickable={isClickable}
        isDeleted={isDeleted}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => isDeleted && setShouldShowTooltip(true)}
        onMouseLeave={() => setShouldShowTooltip(false)}
      >
        <Chip
          label={isDeleted ? '' : (file.label ?? '')}
          isLabelHidden={isDeleted}
          maxWidth={isDeleted ? undefined : MAX_WIDTH}
          leftComponent={fileIcon}
          rightComponent={
            isDeleted ? (
              <StyledDeletedLabel>{file.label}</StyledDeletedLabel>
            ) : undefined
          }
          variant={ChipVariant.Highlighted}
          clickable={isClickable}
        />
      </StyledClickableContainer>
      {isDeleted &&
        shouldShowTooltip &&
        createPortal(
          <AppTooltip
            anchorSelect={tooltipAnchorSelect}
            content={t`File no longer exists`}
            delay={TooltipDelay.shortDelay}
            isOpen={true}
            noArrow
            place={TooltipPosition.Top}
            positionStrategy="fixed"
          />,
          document.body,
        )}
    </>
  );
};
