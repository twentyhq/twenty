import styled from '@emotion/styled';

import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
};

const StyledContainer = styled.div`
  display: flex;
  padding-top: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export function NoTopBarContainer({ children }: OwnProps) {
  return (
    <StyledContainer>
      <RightDrawerContainer topMargin={16}>{children}</RightDrawerContainer>
    </StyledContainer>
  );
}
