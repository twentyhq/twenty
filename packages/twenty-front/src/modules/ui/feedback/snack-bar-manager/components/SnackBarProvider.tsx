import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';

import { useSnackBarManagerScopedStates } from '@/ui/feedback/snack-bar-manager/hooks/internal/useSnackBarManagerScopedStates';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { SnackBar } from './SnackBar';

const StyledSnackBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: ${({ theme }) => theme.lastLayerZIndex};
`;

const StyledSnackBarMotionContainer = styled(motion.div)`
  margin-right: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const variants = {
  out: {
    opacity: 0,
    y: 40,
  },
  in: {
    opacity: 1,
    y: 0,
  },
};

export const SnackBarProvider = ({ children }: React.PropsWithChildren) => {
  const { snackBarInternal } = useSnackBarManagerScopedStates();
  const { handleSnackBarClose } = useSnackBar();

  return (
    <>
      {children}
      <StyledSnackBarContainer>
        <AnimatePresence>
          {snackBarInternal.queue.map(
            ({ duration, icon, id, message, title, variant }) => (
              <StyledSnackBarMotionContainer
                key={id}
                variants={variants}
                initial="out"
                animate="in"
                exit="out"
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
        </AnimatePresence>
      </StyledSnackBarContainer>
    </>
  );
};
