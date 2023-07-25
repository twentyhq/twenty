import styled from '@emotion/styled';

type Props = React.ComponentProps<'div'>;

const StyledLogo = styled.div`
  height: 48px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  img {
    height: 100%;
    width: 100%;
  }

  width: 48px;
`;

export function Logo(props: Props) {
  return (
    <StyledLogo {...props}>
      <img src="/icons/android/android-launchericon-192-192.png" alt="logo" />
    </StyledLogo>
  );
}
