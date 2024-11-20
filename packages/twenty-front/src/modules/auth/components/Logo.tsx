import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';

type LogoProps = {
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  size?: string | null;
};

const StyledContainer = styled.div<StyledPrimaryLogoProps>`
  height: ${({ size }) => size};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  position: relative;
  width: ${({ size }) => size};
`;

const StyledSecondaryLogo = styled.img<StyledPrimaryLogoProps>`
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: calc(${({ size }) => size} / 2);
  width: calc(${({ size }) => size} / 2);
`;

const StyledSecondaryLogoContainer = styled.div<StyledPrimaryLogoProps>`
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

type StyledPrimaryLogoProps = {
  logo?: string | null;
  size?: string | null;
};

const StyledPrimaryLogo = styled.div<{ src: string }>`
  background: url(${(props) => props.src});
  background-size: cover;
  height: 100%;
  width: 100%;
`;

export const Logo = (props: LogoProps) => {
  const theme = useTheme();

  const size = props.size ?? theme.spacing(12);

  const defaultPrimaryLogoUrl = `${window.location.origin}/icons/android/android-launchericon-192-192.png`;

  const primaryLogoUrl = getImageAbsoluteURI(
    props.primaryLogo ?? defaultPrimaryLogoUrl,
  );
  const secondaryLogoUrl = getImageAbsoluteURI(props.secondaryLogo);

  return (
    <StyledContainer size={size}>
      <StyledPrimaryLogo src={primaryLogoUrl} />
      {secondaryLogoUrl && (
        <StyledSecondaryLogoContainer size={size}>
          <StyledSecondaryLogo size={size} src={secondaryLogoUrl} />
        </StyledSecondaryLogoContainer>
      )}
    </StyledContainer>
  );
};
