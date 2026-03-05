import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { SidePanelContainer } from '@/side-panel/components/SidePanelContainer';
import { SidePanelTopBar } from '@/side-panel/components/SidePanelTopBar';
import { SIDE_PANEL_PAGES_CONFIG } from '@/side-panel/constants/SidePanelPagesConfig';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledSidePanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const SidePanelRouter = () => {
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);

  const sidePanelPageComponent = isDefined(sidePanelPage) ? (
    SIDE_PANEL_PAGES_CONFIG.get(sidePanelPage)
  ) : (
    <></>
  );

  const { theme } = useContext(ThemeContext);

  return (
    <SidePanelContainer>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: sidePanelPageInfo.instanceId }}
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
        <StyledSidePanelContent>
          <ActionMenuContextProvider
            isInSidePanel={true}
            displayType="listItem"
            actionMenuType="command-menu"
          >
            {sidePanelPageComponent}
          </ActionMenuContextProvider>
        </StyledSidePanelContent>
      </SidePanelPageComponentInstanceContext.Provider>
    </SidePanelContainer>
  );
};
