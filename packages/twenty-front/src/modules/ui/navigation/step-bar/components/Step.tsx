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

const StyledStepCircle = styled(motion.div)<{ isNextStep: boolean }>`
  align-items: center;
  border-radius: 50%;
  border-style: solid;
  border-width: 1px;
  border-color: ${({ theme, isNextStep }) =>
    isNextStep
      ? theme.border.color.inverted
      : theme.border.color.medium} !important;
  display: flex;
  flex-basis: auto;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 20px;
`;

const StyledStepIndex = styled.span<{ isNextStep: boolean }>`
  color: ${({ theme, isNextStep }) =>
    isNextStep ? theme.font.color.secondary : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledStepLabel = styled.span<{ isActive: boolean; isNextStep: boolean }>`
  color: ${({ theme, isActive, isNextStep }) =>
    isActive || isNextStep
      ? theme.font.color.primary
      : theme.font.color.tertiary};
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
    isActive?: boolean;
    isLast?: boolean;
    index?: number;
    label: string;
    activeStep?: number;
  };

export const Step = ({
  isActive = false,
  isLast = false,
  index = 0,
  label,
  children,
  activeStep = 0,
}: StepProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  const variantsCircle = {
    active: {
      backgroundColor: theme.font.color.primary,
      borderColor: theme.font.color.primary,
      transition: { duration: 0.5 },
    },
    inactive: {
      backgroundColor: theme.background.transparent.lighter,
      borderColor: theme.border.color.medium,
      transition: { duration: 0.5 },
    },
  };

  const variantsLine = {
    active: {
      backgroundColor: theme.font.color.primary,
      transition: { duration: 0.5 },
    },
    inactive: {
      backgroundColor: theme.border.color.medium,
      transition: { duration: 0.5 },
    },
  };

  const isNextStep = activeStep + 1 === index;

  return (
    <StyledContainer isLast={isLast}>
      <StyledStepCircle
        variants={variantsCircle}
        animate={isActive ? 'active' : 'inactive'}
        isNextStep={isNextStep}
      >
        {isActive && (
          <AnimatedCheckmark
            isAnimating={isActive}
            color={theme.grayScale.gray0}
          />
        )}
        {!isActive && (
          <StyledStepIndex isNextStep={isNextStep}>{index + 1}</StyledStepIndex>
        )}
      </StyledStepCircle>
      <StyledStepLabel isNextStep={isNextStep} isActive={isActive}>
        {label}
      </StyledStepLabel>
      {!isLast && !isMobile && (
        <StyledStepLine
          variants={variantsLine}
          animate={isActive ? 'active' : 'inactive'}
        />
      )}
      {isActive && children}
    </StyledContainer>
  );
};

Step.displayName = 'StepBar';
