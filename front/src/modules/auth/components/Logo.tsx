import styled from '@emotion/styled';

import { getImageAbsoluteURIOrBase64 } from '@/users/utils/getProfilePictureAbsoluteURI';

type LogoProps = React.ComponentProps<'div'> & {
  workspaceLogo?: string | null;
};

const StyledContainer = styled.div`
  height: 48px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  position: relative;
  width: 48px;
`;

const StyledTwentyLogo = styled.img`
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: 24px;
  width: 24px;
`;

const StyledTwentyLogoContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: ${({ theme }) => `-${theme.spacing(3)}`};
  display: flex;
  height: 28px;
  justify-content: center;

  position: absolute;
  right: ${({ theme }) => `-${theme.spacing(3)}`};
  width: 28px;
`;

type StyledMainLogoProps = {
  logo?: string | null;
};

const StyledMainLogo = styled.div<StyledMainLogoProps>`
  background: url(${(props) => props.logo});
  background-size: cover;
  height: 100%;

  width: 100%;
`;

export const Logo = ({ workspaceLogo, ...props }: LogoProps) => {
  if (!workspaceLogo) {
    return (
      // eslint-disable-next-line twenty/no-spread-props
      <StyledContainer {...props}>
        <StyledMainLogo logo="/icons/android/android-launchericon-192-192.png" />
      </StyledContainer>
    );
  }

  return (
    // eslint-disable-next-line twenty/no-spread-props
    <StyledContainer {...props}>
      <StyledMainLogo logo={getImageAbsoluteURIOrBase64(workspaceLogo)} />
      <StyledTwentyLogoContainer>
        <StyledTwentyLogo src="/icons/android/android-launchericon-192-192.png" />
      </StyledTwentyLogoContainer>
    </StyledContainer>
  );
};
