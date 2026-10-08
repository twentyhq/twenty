import { styled } from '@linaria/react';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellSkeletonLoader } from '@/object-record/record-inline-cell/components/RecordInlineCellSkeletonLoader';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledClickableContainer = styled.div<{
  readonly?: boolean;
  isCentered?: boolean;
}>`
  align-items: center;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};

  justify-content: ${({ isCentered }) =>
    isCentered === true ? 'center' : 'normal'};
  width: 100%;
`;

export const RecordInlineCellValue = () => {
  const { readonly, loading, isCentered, onOpenEditMode } =
    useRecordInlineCellContext();
  const { isFocused } = useFieldFocus();
  const { isOnDemand } = useContext(FieldContext);

  if (loading === true) {
    return <RecordInlineCellSkeletonLoader />;
  }

  if (isOnDemand) {
    return <FieldDisplay />;
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
