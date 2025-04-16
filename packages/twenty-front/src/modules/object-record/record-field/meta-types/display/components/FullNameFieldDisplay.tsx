import { isNonEmptyString } from '@sniptt/guards';

import { useFullNameFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFullNameFieldDisplay';
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledFullNameFieldDisplayContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

  return (
    <StyledFullNameFieldDisplayContainer>
      <OverflowingTextWithTooltip text={content} />
    </StyledFullNameFieldDisplayContainer>
  );
};
