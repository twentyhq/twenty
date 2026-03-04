import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { snackBarInternalComponentState } from '@/ui/feedback/snack-bar-manager/states/snackBarInternalComponentState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { SnackBar } from './SnackBar';

const StyledSnackBarContainer = styled.div`
  bottom: ${themeCssVariables.spacing[3]};
  display: flex;
  flex-direction: column;
  position: fixed;
  right: ${themeCssVariables.spacing[3]};
  z-index: ${RootStackingContextZIndices.SnackBar};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    bottom: auto;
    left: 0;
    right: 0;
    top: 0;
  }
`;

export const SnackBarProvider = ({ children }: React.PropsWithChildren) => {
  const snackBarInternal = useAtomComponentStateValue(
    snackBarInternalComponentState,
  );

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
              actionText,
              actionOnClick,
              actionTo,
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
                    actionText,
                    actionOnClick,
                    actionTo,
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
