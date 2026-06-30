import { CommandMenuOpenContainer } from '@/command-menu/components/CommandMenuOpenContainer';
import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';

import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const StyledCommandMenuMobileFullScreenContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const CommandMenuForMobile = () => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  return (
    <AnimatePresence>
      {isSidePanelOpened && (
        <>
          {createPortal(
            <StyledCommandMenuMobileFullScreenContainer>
              <CommandMenuOpenContainer>
                <SidePanelRouter />
              </CommandMenuOpenContainer>
            </StyledCommandMenuMobileFullScreenContainer>,
            document.body,
          )}
        </>
      )}
    </AnimatePresence>
  );
};
