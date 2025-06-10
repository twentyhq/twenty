import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';

import { useSnackBarManagerScopedStates } from '@/ui/feedback/snack-bar-manager/hooks/internal/useSnackBarManagerScopedStates';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { SnackBar } from './SnackBar';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledSnackBarContainer = styled.div`
  bottom: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  position: fixed;
  right: ${({ theme }) => theme.spacing(3)};
  z-index: ${RootStackingContextZIndices.SnackBar};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    bottom: auto;
    left: 0;
    right: 0;
    top: 0;
  }
`;

export const SnackBarProvider = ({ children }: React.PropsWithChildren) => {
  const { snackBarInternal } = useSnackBarManagerScopedStates();
  const { handleSnackBarClose } = useSnackBar();
  const isMobile = useIsMobile();

  const variants = {
    out: {
      opacity: 0,
      y: isMobile ? -40 : 40,
    },
    in: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <>
      {children}
      <StyledSnackBarContainer>
        <AnimatePresence>
          {snackBarInternal.queue.map(
            ({
              duration,
              icon,
              id,
              message,
              detailedMessage,
              variant,
              link,
            }) => (
              <motion.div
                key={id}
                variants={variants}
                initial="out"
                animate="in"
                exit="out"
                transition={{ duration: 0.5 }}
                layout
              >
                <SnackBar
                  {...{
                    duration,
                    icon,
                    message,
                    detailedMessage,
                    variant,
                    link,
                  }}
                  onClose={() => handleSnackBarClose(id)}
                />
              </motion.div>
            ),
          )}
        </AnimatePresence>
      </StyledSnackBarContainer>
    </>
  );
};
