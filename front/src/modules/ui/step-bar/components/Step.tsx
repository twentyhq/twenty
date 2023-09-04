import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { AnimatedCheckmark } from '@/ui/checkmark/components/AnimatedCheckmark';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledContainer = styled.div<{ isLast: boolean }>`
  align-items: center;
  display: flex;
  flex-grow: ${({ isLast }) => (isLast ? '0' : '1')};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-grow: 0;
  }
`;

const StyledStepCircle = styled(motion.div)`
  align-items: center;
  border-radius: 50%;
  border-style: solid;
  border-width: 1px;
  display: flex;
  flex-basis: auto;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 20px;
`;

const StyledStepIndex = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledStepLabel = styled.span<{ isActive: boolean }>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
  };

export const Step = ({
  isActive = false,
  isLast = false,
  index = 0,
  label,
  children,
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

  return (
    <StyledContainer isLast={isLast}>
      <StyledStepCircle
        variants={variantsCircle}
        animate={isActive ? 'active' : 'inactive'}
      >
        {isActive && (
          <AnimatedCheckmark
            isAnimating={isActive}
            color={theme.grayScale.gray0}
          />
        )}
        {!isActive && <StyledStepIndex>{index + 1}</StyledStepIndex>}
      </StyledStepCircle>
      <StyledStepLabel isActive={isActive}>{label}</StyledStepLabel>
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

Step.displayName = 'StepBar/Step';
