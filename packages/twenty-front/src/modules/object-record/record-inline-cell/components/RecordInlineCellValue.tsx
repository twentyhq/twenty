import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { RecordInlineCellContainerProps } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { RecordInlineCellSkeletonLoader } from '@/object-record/record-inline-cell/components/RecordInlineCellSkeletonLoader';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';

const StyledClickableContainer = styled.div<{
  readonly?: boolean;
  isCentered?: boolean;
}>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  ${({ isCentered }) =>
    isCentered === true &&
    `
      justify-content: center;
    `};

  ${({ readonly }) =>
    !readonly &&
    css`
      cursor: pointer;
    `};
`;

type RecordInlineCellValueProps = Pick<
  RecordInlineCellContainerProps,
  | 'displayModeContent'
  | 'customEditHotkeyScope'
  | 'editModeContent'
  | 'editModeContentOnly'
  | 'isDisplayModeFixHeight'
  | 'disableHoverEffect'
  | 'readonly'
  | 'buttonIcon'
  | 'loading'
  | 'showLabel'
  | 'label'
  | 'isCentered'
>;

export const RecordInlineCellValue = ({
  displayModeContent,
  customEditHotkeyScope,
  disableHoverEffect,
  editModeContent,
  editModeContentOnly,
  isDisplayModeFixHeight,
  readonly,
  buttonIcon,
  loading,
  showLabel,
  label,
  isCentered,
}: RecordInlineCellValueProps) => {
  const { isFocused } = useFieldFocus();

  const { isInlineCellInEditMode, openInlineCell } = useInlineCell();

  const handleDisplayModeClick = () => {
    if (!readonly && !editModeContentOnly) {
      openInlineCell(customEditHotkeyScope);
    }
  };

  if (loading === true) {
    return <RecordInlineCellSkeletonLoader />;
  }

  return (
    <>
      {!readonly && isInlineCellInEditMode && (
        <RecordInlineCellEditMode>{editModeContent}</RecordInlineCellEditMode>
      )}
      {editModeContentOnly ? (
        <StyledClickableContainer readonly={readonly} isCentered={isCentered}>
          <RecordInlineCellDisplayMode
            disableHoverEffect={disableHoverEffect}
            isDisplayModeFixHeight={isDisplayModeFixHeight}
            isHovered={isFocused}
            emptyPlaceholder={showLabel ? 'Empty' : label}
          >
            {editModeContent}
          </RecordInlineCellDisplayMode>
        </StyledClickableContainer>
      ) : (
        <StyledClickableContainer
          readonly={readonly}
          onClick={handleDisplayModeClick}
          isCentered={isCentered}
        >
          <RecordInlineCellDisplayMode
            disableHoverEffect={disableHoverEffect}
            isDisplayModeFixHeight={isDisplayModeFixHeight}
            isHovered={isFocused}
            emptyPlaceholder={showLabel ? 'Empty' : label}
            buttonIcon={buttonIcon}
            editModeContentOnly={editModeContentOnly}
          >
            {displayModeContent}
          </RecordInlineCellDisplayMode>
        </StyledClickableContainer>
      )}
    </>
  );
};
