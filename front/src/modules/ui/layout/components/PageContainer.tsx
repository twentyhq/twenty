import styled from '@emotion/styled';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function PageContainer({ children }: OwnProps) {
  return <StyledContainer>{children}</StyledContainer>;
}
