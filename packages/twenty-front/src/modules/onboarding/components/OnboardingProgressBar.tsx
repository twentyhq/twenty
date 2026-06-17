import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledStep = styled.div<{ isActive: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.invertedPrimary
      : themeCssVariables.border.color.medium};
  border-radius: 3px;
  height: 6px;
  width: ${({ isActive }) => (isActive ? '16px' : '6px')};
`;

type OnboardingProgressBarProps = {
  activeStep: number;
  stepCount?: number;
};

export const OnboardingProgressBar = ({
  activeStep,
  stepCount = 4,
}: OnboardingProgressBarProps) => {
  return (
    <StyledContainer>
      {Array.from({ length: stepCount }).map((_, index) => (
        <StyledStep key={index} isActive={index === activeStep} />
      ))}
    </StyledContainer>
  );
};
