import styled from '@emotion/styled';

const StyledLogo = styled.div`
  height: 40px;
  width: 40px;

  img {
    height: 100%;
    width: 100%;
  }
`;

export function Logo(): JSX.Element {
  return (
    <StyledLogo>
      <img src="icons/android/android-launchericon-192-192.png" alt="logo" />
    </StyledLogo>
  );
}
