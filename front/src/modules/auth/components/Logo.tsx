import styled from '@emotion/styled';

import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';

type Props = React.ComponentProps<'div'> & {
  workspaceLogo?: string | null;
};

const StyledLogo = styled.div`
  height: 48px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  img {
    height: 100%;
    width: 100%;
  }

  position: relative;
  width: 48px;
`;

type StyledWorkspaceLogoProps = {
  logo?: string | null;
};

const StyledWorkspaceLogo = styled.div<StyledWorkspaceLogoProps>`
  background: url(${(props) => props.logo});
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  bottom: -12px;
  height: 24px;
  position: absolute;
  right: -12px;
  width: 24px;
`;

export function Logo({ workspaceLogo, ...props }: Props) {
  return (
    <StyledLogo {...props}>
      <StyledWorkspaceLogo logo={getImageAbsoluteURIOrBase64(workspaceLogo)} />
      <img src="/icons/android/android-launchericon-192-192.png" alt="logo" />
    </StyledLogo>
  );
}
