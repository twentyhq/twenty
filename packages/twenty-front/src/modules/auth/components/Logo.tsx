import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';
import { Spacing } from 'twenty-ui';

type LogoProps = {
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  size?: Spacing | null;
};

const StyledContainer = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  position: relative;
  width: ${({ size }) => size}px;
`;

const StyledSecondaryLogo = styled.img<{ size: number }>`
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: calc(${({ size }) => size}px / 2);
  width: calc(${({ size }) => size}px / 2);
`;

const StyledSecondaryLogoContainer = styled.div<{ size: number }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: calc(
    (${({ theme }) => theme.spacing(3)} * -1) * ${({ size }) => size} / 48
  );
  display: flex;
  height: calc(
    (${({ theme }) => theme.spacing(7)} * ${({ size }) => size}) / 48
  );
  justify-content: center;

  position: absolute;
  right: calc(
    (${({ theme }) => theme.spacing(3)} * -1) * ${({ size }) => size} / 48
  );
  width: calc(${({ theme }) => theme.spacing(7)} * ${({ size }) => size} / 48);
`;

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

  const sizeInNumber = parseInt(size, 10);

  return (
    <StyledContainer size={sizeInNumber}>
      <StyledPrimaryLogo src={primaryLogoUrl} />
      {secondaryLogoUrl && (
        <StyledSecondaryLogoContainer size={sizeInNumber}>
          <StyledSecondaryLogo size={sizeInNumber} src={secondaryLogoUrl} />
        </StyledSecondaryLogoContainer>
      )}
    </StyledContainer>
  );
};
