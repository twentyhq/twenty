import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { Theme, withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledDiv = styled.div`
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  height: 28px;
  padding: ${({ theme }) => theme.spacing(0, 1.25)};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledEmptyText = withTheme(styled.div<{ theme: Theme }>`
  color: ${({ theme }) => theme.font.color.tertiary};
`);

export const RecordTitleCellSingleTextDisplayMode = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordValue = useRecordValue(recordId);
  const isEmpty =
    recordValue?.[fieldDefinition.metadata.fieldName].trim() === '';

  const { openInlineCell } = useInlineCell();

  return (
    <StyledDiv onClick={() => openInlineCell()}>
      {isEmpty ? (
        <StyledEmptyText>Untitled</StyledEmptyText>
      ) : (
        <OverflowingTextWithTooltip
          text={
            recordValue?.[fieldDefinition.metadata.fieldName] ||
            fieldDefinition.label
          }
        />
      )}
    </StyledDiv>
  );
};
