import styled from '@emotion/styled';

type OwnProps = {
  children: JSX.Element[] | JSX.Element;
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;

function HorizontalyAlignedContainer({ children }: OwnProps) {
  return <StyledContainer>{children}</StyledContainer>;
}

export default HorizontalyAlignedContainer;
