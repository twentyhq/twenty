import styled from '@emotion/styled';

type OwnProps = {
  children: JSX.Element[];
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;

function HorizontalyAlignedContainer({ children: children }: OwnProps) {
  return <StyledContainer>{children}</StyledContainer>;
}

export default HorizontalyAlignedContainer;
