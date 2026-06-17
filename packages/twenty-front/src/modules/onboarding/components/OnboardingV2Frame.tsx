import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { OnboardingProgressBar } from '@/onboarding/components/OnboardingProgressBar';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledPage = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-top: 120px;
  position: relative;
  width: 100%;
`;

const StyledTopLeftLogo = styled.img`
  height: 24px;
  left: ${themeCssVariables.spacing[6]};
  position: absolute;
  top: ${themeCssVariables.spacing[6]};
  width: 24px;
`;

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 340px;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSubTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

type OnboardingV2FrameProps = {
  activeStep: number;
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
};

export const OnboardingV2Frame = ({
  activeStep,
  title,
  subtitle,
  children,
}: OnboardingV2FrameProps) => {
  const defaultLogoUrl = `${window.location.origin}/images/icons/android/android-launchericon-192-192.png`;

  return (
    <StyledPage>
      <StyledTopLeftLogo src={defaultLogoUrl} alt="Twenty" />
      <StyledColumn>
        <StyledHeader>
          <OnboardingProgressBar activeStep={activeStep} />
          <StyledTitle>{title}</StyledTitle>
          <StyledSubTitle>{subtitle}</StyledSubTitle>
        </StyledHeader>
        {children}
      </StyledColumn>
    </StyledPage>
  );
};
