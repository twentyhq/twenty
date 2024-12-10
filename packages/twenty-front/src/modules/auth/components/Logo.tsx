import styled from '@emotion/styled';
import { getImageAbsoluteURI, isDefined } from 'twenty-ui';

type LogoProps = {
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
};

const StyledContainer = styled.div`
  height: ${({ theme }) => theme.spacing(12)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};

  position: relative;
  width: ${({ theme }) => theme.spacing(12)};
`;

const StyledSecondaryLogo = styled.img`
  border-radius: ${({ theme }) => theme.border.radius.xs};
  height: ${({ theme }) => theme.spacing(6)};
  width: ${({ theme }) => theme.spacing(6)};
`;

const StyledSecondaryLogoContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: ${({ theme }) => `-${theme.spacing(3)}`};
  display: flex;
  height: ${({ theme }) => theme.spacing(7)};
  justify-content: center;

  position: absolute;
  right: ${({ theme }) => `-${theme.spacing(3)}`};
  width: ${({ theme }) => theme.spacing(7)};
`;

const StyledPrimaryLogo = styled.div<{ src: string }>`
  background: url(${(props) => props.src});
  background-size: cover;
  height: 100%;
  width: 100%;
`;

export const Logo = (props: LogoProps) => {
  const defaultPrimaryLogoUrl = `${window.location.origin}/icons/android/android-launchericon-192-192.png`;

  const primaryLogoUrl = getImageAbsoluteURI(
    props.primaryLogo ?? defaultPrimaryLogoUrl,
  );
  const secondaryLogoUrl = isDefined(props.secondaryLogo)
    ? getImageAbsoluteURI(props.secondaryLogo)
    : null;

  return (
    <StyledContainer>
      <StyledPrimaryLogo src={primaryLogoUrl} />
      {secondaryLogoUrl && (
        <StyledSecondaryLogoContainer>
          <StyledSecondaryLogo src={secondaryLogoUrl} />
        </StyledSecondaryLogoContainer>
      )}
    </StyledContainer>
  );
};
