import styled from '@emotion/styled';

import { H3Title } from 'twenty-ui/display';

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type ConfigVariableTitleProps = {
  name: string;
  description: string;
};

export const ConfigVariableTitle = ({
  name,
  description,
}: ConfigVariableTitleProps) => {
  return (
    <StyledTitleContainer>
      <StyledTitleRow>
        <H3Title title={name} description={description} />
      </StyledTitleRow>
    </StyledTitleContainer>
  );
};
