import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { RecordInlineCellSkeletonLoader } from '@/object-record/record-inline-cell/components/RecordInlineCellSkeletonLoader';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';

const StyledClickableContainer = styled.div<{
  readonly?: boolean;
  isCentered?: boolean;
}>`
  align-items: center;
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

export const RecordInlineCellValue = () => {
  const {
    displayModeContent,
    customEditHotkeyScope,
    editModeContent,
    editModeContentOnly,
    readonly,
    loading,
    isCentered,
  } = useRecordInlineCellContext();

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
          <RecordInlineCellDisplayMode>
            {editModeContent}
          </RecordInlineCellDisplayMode>
        </StyledClickableContainer>
      ) : (
        <StyledClickableContainer
          readonly={readonly}
          onClick={handleDisplayModeClick}
          isCentered={isCentered}
        >
          <RecordInlineCellDisplayMode>
            {displayModeContent}
          </RecordInlineCellDisplayMode>
        </StyledClickableContainer>
      )}
    </>
  );
};
