import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFullNameFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFullNameFieldDisplay';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

const StyledButton = styled('button')`
  align-items: center;
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: content-box;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 20px;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const RecordTitleFullNameFieldDisplay = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const { openInlineCell } = useInlineCell();

  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

  return (
    <StyledButton onClick={() => openInlineCell()}>
      {isNonEmptyString(content) ? content : fieldDefinition.label}
    </StyledButton>
  );
};
