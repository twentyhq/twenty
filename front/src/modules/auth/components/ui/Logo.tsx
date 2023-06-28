import styled from '@emotion/styled';

type Props = React.ComponentProps<'div'>;

const StyledLogo = styled.div`
  height: 48px;

  img {
    height: 100%;
    width: 100%;
  }

  width: 48px;
`;

export const Logo: React.FC<Props> = (props) => {
  return (
    <StyledLogo {...props}>
      <img src="/icons/android/android-launchericon-192-192.png" alt="logo" />
    </StyledLogo>
  );
};
