import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui';

const StyledDiv = styled.div`
  align-items: center;
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  height: 28px;
  line-height: 28px;
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const RecordTitleCellSingleTextDisplayMode = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordValue = useRecordValue(recordId);

  const { openInlineCell } = useInlineCell();

  return (
    <StyledDiv onClick={() => openInlineCell()}>
      <OverflowingTextWithTooltip
        text={
          recordValue?.[fieldDefinition.metadata.fieldName] ||
          fieldDefinition.label
        }
      />
    </StyledDiv>
  );
};
