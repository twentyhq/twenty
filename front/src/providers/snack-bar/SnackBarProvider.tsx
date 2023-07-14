import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'framer-motion';
import { useRecoilState } from 'recoil';

import { SnackBar } from '@/snack-bar/components/SnackBar';

import { snackBarInternalState } from '../../modules/snack-bar/states/snackBarState';

const SnackBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 99999999;
`;

const SnackBarMotionContainer = styled(motion.div)`
  margin-right: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const variants = {
  initial: {
    opacity: 0,
    y: -40,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -40,
  },
};

const reducedVariants = {
  initial: {
    opacity: 0,
    y: -40,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -40,
  },
};

export function SnackBarProvider({ children }: React.PropsWithChildren) {
  const reducedMotion = useReducedMotion();

  const [snackBarState, setSnackBarState] = useRecoilState(
    snackBarInternalState,
  );

  // Handle snackbar close event
  const handleSnackBarClose = (id: string) => {
    setSnackBarState((prevState) => ({
      ...prevState,
      queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
    }));
  };

  return (
    <>
      {children}
      <SnackBarContainer>
        {snackBarState.queue.map((snackBar) => (
          <SnackBarMotionContainer
            key={snackBar.id}
            variants={reducedMotion ? reducedVariants : variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
            layout
          >
            <SnackBar
              {...snackBar}
              onClose={() => handleSnackBarClose(snackBar.id)}
            />
          </SnackBarMotionContainer>
        ))}
      </SnackBarContainer>
    </>
  );
}
