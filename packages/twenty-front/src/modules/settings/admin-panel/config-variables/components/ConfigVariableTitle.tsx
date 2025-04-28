import styled from '@emotion/styled';

import { H3Title } from 'twenty-ui/display';
import { ConfigSource } from '~/generated/graphql';

import { useSourceContent } from '../utils/useSourceContent';

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

const StyledSourceIndicator = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type ConfigVariableTitleProps = {
  name: string;
  source: ConfigSource;
};

export const ConfigVariableTitle = ({
  name,
  source,
}: ConfigVariableTitleProps) => {
  const sourceContent = useSourceContent(source);

  return (
    <StyledTitleContainer>
      <StyledTitleRow>
        <H3Title title={name} />
      </StyledTitleRow>
      <StyledSourceIndicator color={sourceContent.color}>
        {sourceContent.text}
      </StyledSourceIndicator>
    </StyledTitleContainer>
  );
};
