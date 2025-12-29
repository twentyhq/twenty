import styled from '@emotion/styled';
import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';

const StyledValueContainer = styled.div<{ readonly: boolean }>`
  display: flex;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const StyledInlineCellBaseContainer = styled.div<{ readonly: boolean }>`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  height: fit-content;
  gap: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  align-items: center;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
`;

export const FieldWidgetInlineCellContainer = () => {
  const { readonly } = useRecordInlineCellContext();

  const { onMouseEnter, onMouseLeave, anchorId } = useContext(FieldContext);

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
    onMouseEnter?.();
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
    onMouseLeave?.();
  };

  return (
    <StyledInlineCellBaseContainer
      readonly={readonly ?? false}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <StyledValueContainer readonly={readonly ?? false} id={anchorId}>
        <RecordInlineCellValue />
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
