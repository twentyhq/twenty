import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';
import { isDefined } from '~/utils/isDefined';

type LogoProps = {
  workspaceLogo?: string | null;
  size?: string | null;
  includeTwentyLogo?: boolean;
};

const StyledContainer = styled.div<StyledMainLogoProps>`
  height: ${({ size }) => size};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  position: relative;
  width: ${({ size }) => size};
`;

const StyledTwentyLogo = styled.img<StyledMainLogoProps>`
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: calc(${({ size }) => size} / 2);
  width: calc(${({ size }) => size} / 2);
`;

const StyledTwentyLogoContainer = styled.div<StyledMainLogoProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: calc(-12 * ${({ size }) => size} / 48);
  display: flex;
  height: calc((28 * ${({ size }) => size}) / 48);
  justify-content: center;

  position: absolute;
  right: calc(-12 * ${({ size }) => size} / 48);
  width: calc(28 * ${({ size }) => size} / 48);
`;

type StyledMainLogoProps = {
  logo?: string | null;
  size?: string | null;
};

const StyledMainLogo = styled.div<Pick<StyledMainLogoProps, 'logo'>>`
  background: url(${(props) => props.logo});
  background-size: cover;
  height: 100%;

  width: 100%;
`;

export const Logo = (props: LogoProps) => {
  const theme = useTheme();

  const size = props.size ?? theme.spacing(12);

  const includeTwentyLogo = isDefined(props.includeTwentyLogo)
    ? props.includeTwentyLogo
    : true;

  if (!props.workspaceLogo) {
    return (
      <StyledContainer size={size}>
        <StyledMainLogo
          size={size}
          logo="/icons/android/android-launchericon-192-192.png"
        />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer size={size}>
      <StyledMainLogo logo={getImageAbsoluteURI(props.workspaceLogo)} />
      {includeTwentyLogo && (
        <StyledTwentyLogoContainer size={size}>
          <StyledTwentyLogo
            size={size}
            src="/icons/android/android-launchericon-192-192.png"
          />
        </StyledTwentyLogoContainer>
      )}
    </StyledContainer>
  );
};
