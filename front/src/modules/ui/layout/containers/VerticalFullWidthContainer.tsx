import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function VerticalFullWidthContainer({
  children,
}: {
  children: JSX.Element[];
}) {
  return <StyledContainer>{children}</StyledContainer>;
}
