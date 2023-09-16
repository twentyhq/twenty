import styled from '@emotion/styled';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const PageContainer = ({ children }: OwnProps) => (
  <StyledContainer>{children}</StyledContainer>
);
