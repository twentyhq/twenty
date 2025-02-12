import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFullNameFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFullNameFieldDisplay';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

const StyledSpan = styled.span`
  align-items: center;
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: content-box;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  height: 28px;
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
    <StyledSpan onClick={() => openInlineCell()}>
      {isNonEmptyString(content) ? content : fieldDefinition.label}
    </StyledSpan>
  );
};
