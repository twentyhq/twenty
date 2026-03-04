import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { SidePanelContainer } from '@/command-menu/components/SidePanelContainer';
import { SidePanelTopBar } from '@/command-menu/components/SidePanelTopBar';
import { SIDE_PANEL_PAGES_CONFIG } from '@/command-menu/constants/SidePanelPagesConfig';
import { sidePanelPageInfoState } from '@/command-menu/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/command-menu/states/sidePanelPageState';
import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

const StyledCommandMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const SidePanelRouter = () => {
  const commandMenuPage = useAtomStateValue(sidePanelPageState);
  const commandMenuPageInfo = useAtomStateValue(sidePanelPageInfoState);

  const commandMenuPageComponent = isDefined(commandMenuPage) ? (
    SIDE_PANEL_PAGES_CONFIG.get(commandMenuPage)
  ) : (
    <></>
  );

  const { theme } = useContext(ThemeContext);

  return (
    <SidePanelContainer>
      <SidePanelPageComponentInstanceContext.Provider
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
          <SidePanelTopBar />
        </motion.div>
        <StyledCommandMenuContent>
          <ActionMenuContextProvider
            isInSidePanel={true}
            displayType="listItem"
            actionMenuType="command-menu"
          >
            {commandMenuPageComponent}
          </ActionMenuContextProvider>
        </StyledCommandMenuContent>
      </SidePanelPageComponentInstanceContext.Provider>
    </SidePanelContainer>
  );
};
