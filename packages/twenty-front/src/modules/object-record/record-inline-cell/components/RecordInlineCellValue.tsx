import { styled } from '@linaria/react';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellSkeletonLoader } from '@/object-record/record-inline-cell/components/RecordInlineCellSkeletonLoader';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledClickableContainer = styled.div<{
  readonly?: boolean;
  isCentered?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;

  justify-content: ${({ isCentered }) =>
    isCentered === true ? 'center' : 'normal'};
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
`;

export const RecordInlineCellValue = () => {
  const { readonly, loading, isCentered, onOpenEditMode } =
    useRecordInlineCellContext();
  const { isFocused } = useFieldFocus();

  if (loading === true) {
    return <RecordInlineCellSkeletonLoader />;
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
