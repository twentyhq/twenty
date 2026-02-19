import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
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
  const { readonly, loading, isCentered, onOpenEditMode } =
    useRecordInlineCellContext();
  const { isFocused } = useFieldFocus();
  const { isForbidden } = useContext(FieldContext);

  if (loading === true) {
    return <RecordInlineCellSkeletonLoader />;
  }

  if (isForbidden === true) {
    return <ForbiddenFieldDisplay />;
  }

  return (
    <StyledClickableContainer readonly={readonly} isCentered={isCentered}>
      <RecordInlineCellDisplayMode
        isHovered={isFocused}
        onClick={onOpenEditMode}
      >
        <FieldDisplay />
      </RecordInlineCellDisplayMode>
    </StyledClickableContainer>
  );
};
