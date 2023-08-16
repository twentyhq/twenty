import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { AnimatedCheckmark } from '@/ui/checkmark/components/AnimatedCheckmark';

const Container = styled.div<{ isLast: boolean }>`
  align-items: center;
  display: flex;
  flex-grow: ${({ isLast }) => (isLast ? '0' : '1')};
`;

const StepCircle = styled(motion.div)<{ isCurrent: boolean }>`
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

const StepIndex = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StepLabel = styled.span<{ isActive: boolean }>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const StepLine = styled(motion.div)<{ isActive: boolean }>`
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
    <Container isLast={isLast}>
      <StepCircle
        isCurrent={isActive}
        variants={variantsCircle}
        animate={isActive ? 'active' : 'inactive'}
      >
        {isActive && (
          <AnimatedCheckmark
            isAnimating={isActive}
            color={theme.grayScale.gray0}
          />
        )}
        {!isActive && <StepIndex>{index + 1}</StepIndex>}
      </StepCircle>
      <StepLabel isActive={isActive}>{label}</StepLabel>
      {!isLast && (
        <StepLine
          isActive={isActive}
          variants={variantsLine}
          animate={isActive ? 'active' : 'inactive'}
        />
      )}
      {isActive && children}
    </Container>
  );
};

Step.displayName = 'StepBar/Step';
