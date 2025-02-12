import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import styled from '@emotion/styled';
import { useContext } from 'react';

const StyledSpan = styled.span`
  align-items: center;
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 28px;
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const RecordTitleCellSingleTextDisplayMode = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordValue = useRecordValue(recordId);

  const { openInlineCell } = useInlineCell();

  return (
    <StyledSpan onClick={() => openInlineCell()}>
      {recordValue?.[fieldDefinition.metadata.fieldName] ||
        fieldDefinition.label}
    </StyledSpan>
  );
};
