import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StepCircle = styled(motion.div)<{ isCurrent: boolean }>`
  align-items: center;
  background: ${({ isCurrent }) => (isCurrent ? 'blue' : 'grey')};
  border-radius: 50%;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StepLabel = styled.div<{ isActive: boolean }>`
  color: ${({ isActive }) => (isActive ? 'blue' : 'grey')};
`;

const StepLine = styled(motion.div)<{ isActive: boolean }>`
  background: ${({ isActive }) => (isActive ? 'blue' : 'grey')};
  height: 2px;
  transition: background 0.3s;
  width: 100%;
`;

export type StepProps = React.PropsWithChildren &
  React.ComponentProps<'div'> & {
    isActive?: boolean;
    isLast?: boolean;
    label: string;
    icon?: React.ReactNode;
  };

export const Step = ({
  isActive = false,
  isLast = false,
  label,
  icon,
  children,
}: StepProps) => {
  return (
    <Container>
      <StepCircle
        isCurrent={isActive}
        animate={{ scale: isActive ? 1.2 : 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
      >
        {icon}
      </StepCircle>
      {!isLast && <StepLine isActive={isActive} />}
      <StepLabel isActive={isActive}>{label}</StepLabel>
      {isActive && children}
    </Container>
  );
};

Step.displayName = 'StepBar/Step';
