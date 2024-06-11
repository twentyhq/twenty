import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { RecordInlineCellContainerProps } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellButton } from '@/object-record/record-inline-cell/components/RecordInlineCellEditButton';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { RecordInlineCellSkeletonLoader } from '@/object-record/record-inline-cell/components/RecordInlineCellSkeletonLoader';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';

const StyledClickableContainer = styled.div<{ readonly?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;

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
  | 'isDisplayModeContentEmpty'
  | 'isDisplayModeFixHeight'
  | 'disableHoverEffect'
  | 'readonly'
  | 'buttonIcon'
  | 'loading'
  | 'showLabel'
  | 'label'
>;

export const RecordInlineCellValue = ({
  displayModeContent,
  customEditHotkeyScope,
  disableHoverEffect,
  editModeContent,
  editModeContentOnly,
  isDisplayModeContentEmpty,
  isDisplayModeFixHeight,
  readonly,
  buttonIcon,
  loading,
  showLabel,
  label,
}: RecordInlineCellValueProps) => {
  const { isFocused } = useFieldFocus();

  const { isInlineCellInEditMode, openInlineCell } = useInlineCell();

  const handleDisplayModeClick = () => {
    if (!readonly && !editModeContentOnly) {
      openInlineCell(customEditHotkeyScope);
    }
  };

  const showEditButton =
    buttonIcon &&
    !isInlineCellInEditMode &&
    isFocused &&
    !editModeContentOnly &&
    !isDisplayModeContentEmpty;

  if (loading === true) {
    return <RecordInlineCellSkeletonLoader />;
  }

  return !readonly && isInlineCellInEditMode ? (
    <RecordInlineCellEditMode>{editModeContent}</RecordInlineCellEditMode>
  ) : editModeContentOnly ? (
    <StyledClickableContainer readonly={readonly}>
      <RecordInlineCellDisplayMode
        disableHoverEffect={disableHoverEffect}
        isDisplayModeContentEmpty={isDisplayModeContentEmpty}
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
    >
      <RecordInlineCellDisplayMode
        disableHoverEffect={disableHoverEffect}
        isDisplayModeContentEmpty={isDisplayModeContentEmpty}
        isDisplayModeFixHeight={isDisplayModeFixHeight}
        isHovered={isFocused}
        emptyPlaceholder={showLabel ? 'Empty' : label}
      >
        {displayModeContent}
      </RecordInlineCellDisplayMode>
      {showEditButton && <RecordInlineCellButton Icon={buttonIcon} />}
    </StyledClickableContainer>
  );
};
