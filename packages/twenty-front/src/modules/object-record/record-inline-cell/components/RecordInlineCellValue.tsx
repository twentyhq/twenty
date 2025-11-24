import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellSkeletonLoader } from '@/object-record/record-inline-cell/components/RecordInlineCellSkeletonLoader';

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
  const { readonly, loading, isCentered } = useRecordInlineCellContext();

  if (loading === true) {
    return <RecordInlineCellSkeletonLoader />;
  }

  return (
    <StyledClickableContainer readonly={readonly} isCentered={isCentered}>
      <RecordInlineCellDisplayMode isHovered={false}>
        <FieldDisplay />
      </RecordInlineCellDisplayMode>
    </StyledClickableContainer>
  );
};
