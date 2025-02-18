import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFullNameFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFullNameFieldDisplay';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
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

export const RecordTitleFullNameFieldDisplay = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const { openInlineCell } = useInlineCell();

  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ')
    .trim();

  return (
    <StyledDiv onClick={() => openInlineCell()}>
      <OverflowingTextWithTooltip
        text={isNonEmptyString(content) ? content : fieldDefinition.label}
      />
    </StyledDiv>
  );
};
