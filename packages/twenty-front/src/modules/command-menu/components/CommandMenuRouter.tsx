import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { CommandMenuContainer } from '@/command-menu/components/CommandMenuContainer';
import { CommandMenuTopBar } from '@/command-menu/components/CommandMenuTopBar';
import { COMMAND_MENU_PAGES_CONFIG } from '@/command-menu/constants/CommandMenuPagesConfig';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';

const StyledCommandMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const CommandMenuRouter = () => {
  const commandMenuPage = useRecoilValueV2(commandMenuPageState);
  const commandMenuPageInfo = useRecoilValueV2(commandMenuPageInfoState);

  const commandMenuPageComponent = isDefined(commandMenuPage) ? (
    COMMAND_MENU_PAGES_CONFIG.get(commandMenuPage)
  ) : (
    <></>
  );

  const theme = useTheme();

  return (
    <CommandMenuContainer>
      <CommandMenuPageComponentInstanceContext.Provider
        value={{ instanceId: commandMenuPageInfo.instanceId }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: theme.animation.duration.instant,
            delay: 0.1,
          }}
        >
          <CommandMenuTopBar />
        </motion.div>
        <StyledCommandMenuContent>
          <ActionMenuContextProvider
            isInRightDrawer={true}
            displayType="listItem"
            actionMenuType="command-menu"
          >
            {commandMenuPageComponent}
          </ActionMenuContextProvider>
        </StyledCommandMenuContent>
      </CommandMenuPageComponentInstanceContext.Provider>
    </CommandMenuContainer>
  );
};
