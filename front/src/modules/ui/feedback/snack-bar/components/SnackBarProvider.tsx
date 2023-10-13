import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'framer-motion';
import { useRecoilState } from 'recoil';

import { snackBarInternalState } from '../states/snackBarState';

import { SnackBar } from './SnackBar';

const StyledSnackBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 99999999;
`;

const StyledSnackBarMotionContainer = styled(motion.div)`
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

export const SnackBarProvider = ({ children }: React.PropsWithChildren) => {
  const reducedMotion = useReducedMotion();

  const [snackBarInternal, setSnackBarInternal] = useRecoilState(
    snackBarInternalState,
  );

  // Handle snackbar close event
  const handleSnackBarClose = (id: string) => {
    setSnackBarInternal((prevState) => ({
      ...prevState,
      queue: prevState.queue.filter((snackBar) => snackBar.id !== id),
    }));
  };

  return (
    <>
      {children}
      <StyledSnackBarContainer>
        {snackBarInternal.queue.map(
          ({ duration, icon, id, message, title, variant }) => (
            <StyledSnackBarMotionContainer
              key={id}
              variants={reducedMotion ? reducedVariants : variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5 }}
              layout
            >
              <SnackBar
                {...{ duration, icon, message, title, variant }}
                onClose={() => handleSnackBarClose(id)}
              />
            </StyledSnackBarMotionContainer>
          ),
        )}
      </StyledSnackBarContainer>
    </>
  );
};
