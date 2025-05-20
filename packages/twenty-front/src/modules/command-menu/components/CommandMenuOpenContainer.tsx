import { COMMAND_MENU_ANIMATION_VARIANTS } from '@/command-menu/constants/CommandMenuAnimationVariants';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { CommandMenuHotkeyScope } from '@/command-menu/types/CommandMenuHotkeyScope';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useTheme } from '@emotion/react';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useRecoilCallback } from 'recoil';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledCommandMenu = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  height: 100%;
  overflow: hidden;
  padding: 0;
  position: fixed;
  right: 0%;
  top: 0%;
  z-index: ${RootStackingContextZIndices.CommandMenu};
  display: flex;
  flex-direction: column;
`;

export const CommandMenuOpenContainer = ({
  children,
}: React.PropsWithChildren) => {
  const isMobile = useIsMobile();

  const targetVariantForAnimation: CommandMenuAnimationVariant = isMobile
    ? 'fullScreen'
    : 'normal';

  const theme = useTheme();

  const { closeCommandMenu } = useCommandMenu();

  const commandMenuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const hotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();

        if (hotkeyScope?.scope === CommandMenuHotkeyScope.CommandMenuFocused) {
          closeCommandMenu();
        }
      },
    [closeCommandMenu],
  );

  useListenClickOutside({
    refs: [commandMenuRef],
    callback: handleClickOutside,
    listenerId: 'COMMAND_MENU_LISTENER_ID',
    excludeClassNames: ['page-header-command-menu-button'],
  });

  return (
    <StyledCommandMenu
      data-testid="command-menu"
      ref={commandMenuRef}
      className="command-menu"
      animate={targetVariantForAnimation}
      initial="closed"
      exit="closed"
      variants={COMMAND_MENU_ANIMATION_VARIANTS}
      transition={{ duration: theme.animation.duration.normal }}
    >
      {children}
    </StyledCommandMenu>
  );
};
