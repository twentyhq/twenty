import styled from '@emotion/styled';

type OwnProps = {
  children: JSX.Element;
};

const StyledContainer = styled.div`
  display: flex;
  height: calc(100vh - 60px);
`;

function FullWidthContainer({ children }: OwnProps) {
  return <StyledContainer>{children}</StyledContainer>;
}

export default FullWidthContainer;
