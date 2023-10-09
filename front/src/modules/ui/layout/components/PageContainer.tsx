import styled from '@emotion/styled';

type PageContainerProps = {
  children: JSX.Element | JSX.Element[];
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const PageContainer = ({ children }: PageContainerProps) => (
  <StyledContainer>{children}</StyledContainer>
);
