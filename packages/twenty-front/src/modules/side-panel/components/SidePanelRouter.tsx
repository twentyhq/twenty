import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { SidePanelContainer } from '@/side-panel/components/SidePanelContainer';
import { SidePanelSubPageRouter } from '@/side-panel/components/SidePanelSubPageRouter';
import { SidePanelTopBar } from '@/side-panel/components/SidePanelTopBar';
import { SIDE_PANEL_PAGES_CONFIG } from '@/side-panel/constants/SidePanelPagesConfig';
import { isPageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/utils/isPageLayoutSidePanelPage';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledSidePanelContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

export const SidePanelRouter = () => {
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const hasSingleTargetedRecord =
    contextStoreTargetedRecordsRule.mode === 'selection' &&
    contextStoreTargetedRecordsRule.selectedRecordIds.length === 1;

  const shouldSkipPageLayoutPage =
    isDefined(sidePanelPage) &&
    isPageLayoutSidePanelPage(sidePanelPage) &&
    (!isDefined(contextStoreCurrentObjectMetadataItemId) ||
      !hasSingleTargetedRecord);

  const rawPageComponent =
    isDefined(sidePanelPage) && !shouldSkipPageLayoutPage
      ? SIDE_PANEL_PAGES_CONFIG.get(sidePanelPage)
      : null;

  const sidePanelPageComponent =
    isDefined(rawPageComponent) && React.isValidElement(rawPageComponent)
      ? React.cloneElement(rawPageComponent, {
          key: sidePanelPageInfo.instanceId,
        })
      : rawPageComponent;

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
          <CommandMenuContextProvider
            isInSidePanel={true}
            displayType="listItem"
            containerType="command-menu-list"
          >
            <SidePanelSubPageRouter>
              {sidePanelPageComponent}
            </SidePanelSubPageRouter>
          </CommandMenuContextProvider>
        </StyledSidePanelContent>
      </SidePanelPageComponentInstanceContext.Provider>
    </SidePanelContainer>
  );
};
