import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { AnimatedCheckmark } from 'twenty-ui/display';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledContainer = styled.div<{ isLast: boolean }>`
  align-items: center;
  display: flex;
  flex-grow: ${({ isLast }) => (isLast ? '0' : '1')};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-grow: 0;
  }
`;

const StyledStepCircle = styled(motion.div)<{ isInNextSteps: boolean }>`
  align-items: center;
  border-radius: 50%;
  border-style: solid;
  border-width: 1px;
  border-color: ${({ theme, isInNextSteps }) =>
    isInNextSteps
      ? theme.border.color.medium
      : theme.border.color.inverted} !important;
  display: flex;
  flex-basis: auto;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 20px;
`;

const StyledStepIndex = styled.span<{ isCurrentStep: boolean }>`
  color: ${({ theme, isCurrentStep }) =>
    isCurrentStep ? theme.font.color.inverted : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledStepLabel = styled.span<{ isInNextSteps: boolean }>`
  color: ${({ theme, isInNextSteps }) =>
    isInNextSteps ? theme.font.color.tertiary : theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-left: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const StyledStepLine = styled(motion.div)`
  height: 2px;
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  width: 100%;
`;

export type StepProps = React.PropsWithChildren &
  React.ComponentProps<'div'> & {
    isLast?: boolean;
    index?: number;
    label: string;
    activeStep?: number;
  };

export const Step = ({
  isLast = false,
  index = 0,
  label,
  children,
  activeStep = 0,
}: StepProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  const variantsLine = {
    previous: {
      backgroundColor: theme.font.color.primary,
      transition: { duration: 0.5 },
    },
    next: {
      backgroundColor: theme.border.color.medium,
      transition: { duration: 0.5 },
    },
  };

  const variantsCircle = {
    current: {
      backgroundColor: theme.background.invertedPrimary,
      transition: { duration: 0.5 },
    },
    previous: {
      backgroundColor: theme.background.secondary,
      transition: { duration: 0.5 },
    },
    next: {
      backgroundColor: theme.background.tertiary,
      transition: { duration: 0.5 },
    },
  };

  const isInPreviousSteps = activeStep > index;
  const isCurrentStep = activeStep === index;
  const isInNextSteps = activeStep < index;

  return (
    <StyledContainer isLast={isLast}>
      <StyledStepCircle
        variants={variantsCircle}
        animate={
          isCurrentStep ? 'current' : isInPreviousSteps ? 'previous' : 'next'
        }
        isInNextSteps={isInNextSteps}
      >
        {isInPreviousSteps && (
          <AnimatedCheckmark
            isAnimating={isInPreviousSteps}
            color={theme.grayScale.gray12}
          />
        )}
        {!isInPreviousSteps && (
          <StyledStepIndex isCurrentStep={isCurrentStep}>
            {index + 1}
          </StyledStepIndex>
        )}
      </StyledStepCircle>
      <StyledStepLabel isInNextSteps={isInNextSteps}>{label}</StyledStepLabel>
      {!isLast && !isMobile && (
        <StyledStepLine
          variants={variantsLine}
          animate={isInPreviousSteps ? 'previous' : 'next'}
        />
      )}
      {(isInPreviousSteps || isCurrentStep) && children}
    </StyledContainer>
  );
};

Step.displayName = 'StepBar';
