import styled from '@emotion/styled';

import { ContentContainer } from './ContentContainer';

type OwnProps = {
  children: JSX.Element;
};

const StyledContainer = styled.div`
  display: flex;
  padding-top: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export function NoTopBarContainer({ children }: OwnProps) {
  return (
    <StyledContainer>
      <ContentContainer topMargin={16}>{children}</ContentContainer>
    </StyledContainer>
  );
}
