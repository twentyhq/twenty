import { CommandMenuOpenContainer } from '@/command-menu/components/CommandMenuOpenContainer';
import { CommandMenuRouter } from '@/command-menu/components/CommandMenuRouter';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import styled from '@emotion/styled';

import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const StyledCommandMenuMobileFullScreenContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const CommandMenuForMobile = () => {
  const isCommandMenuOpened = useRecoilValueV2(isCommandMenuOpenedStateV2);

  return (
    <AnimatePresence>
      {isCommandMenuOpened && (
        <>
          {createPortal(
            <StyledCommandMenuMobileFullScreenContainer>
              <CommandMenuOpenContainer>
                <CommandMenuRouter />
              </CommandMenuOpenContainer>
            </StyledCommandMenuMobileFullScreenContainer>,
            document.body,
          )}
        </>
      )}
    </AnimatePresence>
  );
};
