import { CommandMenuOpenContainer } from '@/command-menu/components/CommandMenuOpenContainer';
import { CommandMenuRouter } from '@/command-menu/components/CommandMenuRouter';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import styled from '@emotion/styled';

import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useRecoilValue } from 'recoil';

const StyledCommandMenuMobileFullScreenContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const CommandMenuForMobile = () => {
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

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
