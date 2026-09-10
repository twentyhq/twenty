import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
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
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { WorkspaceSurfaceHeaderPortalContext } from '@/ui/layout/contexts/WorkspaceSurfaceHeaderPortalContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import React, { useContext, useMemo, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledSidePanelContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

export const SidePanelRouter = () => {
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const currentNavigationItem = sidePanelNavigationStack.at(-1);
  const sidePanelPage =
    currentNavigationItem?.page ?? SidePanelPages.CommandMenuDisplay;
  const sidePanelPageInstanceId = currentNavigationItem?.pageId ?? '';

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
          key: sidePanelPageInstanceId,
        })
      : rawPageComponent;

  const { theme } = useContext(ThemeContext);

  const [headerTitlePortal, setHeaderTitlePortal] =
    useState<HTMLElement | null>(null);
  const [headerActionsPortal, setHeaderActionsPortal] =
    useState<HTMLElement | null>(null);

  const workspaceSurface = useMemo(
    () => ({
      type: 'side-panel' as const,
      instanceId: sidePanelPageInstanceId,
      routedFlowStateScopeId:
        sidePanelPage === SidePanelPages.RoutedPage
          ? (currentNavigationItem?.routedFlowStateScopeId ??
            sidePanelPageInstanceId)
          : undefined,
      ownsRouteLocation: false,
    }),
    [
      currentNavigationItem?.routedFlowStateScopeId,
      sidePanelPage,
      sidePanelPageInstanceId,
    ],
  );

  const headerPortal = useMemo(
    () => ({ title: headerTitlePortal, actions: headerActionsPortal }),
    [headerActionsPortal, headerTitlePortal],
  );

  return (
    <SidePanelContainer>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: sidePanelPageInstanceId }}
      >
        <WorkspaceSurfaceContext.Provider value={workspaceSurface}>
          <WorkspaceSurfaceHeaderPortalContext.Provider value={headerPortal}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: theme.animation.duration.instant,
                delay: 0.1,
              }}
            >
              <SidePanelTopBar
                setHeaderTitlePortal={setHeaderTitlePortal}
                setHeaderActionsPortal={setHeaderActionsPortal}
              />
            </motion.div>
            <StyledSidePanelContent>
              <CommandMenuContextProvider
                displayType="listItem"
                containerType={CommandMenuItemContainerType.CommandMenuList}
              >
                <SidePanelSubPageRouter>
                  {sidePanelPageComponent}
                </SidePanelSubPageRouter>
              </CommandMenuContextProvider>
            </StyledSidePanelContent>
          </WorkspaceSurfaceHeaderPortalContext.Provider>
        </WorkspaceSurfaceContext.Provider>
      </SidePanelPageComponentInstanceContext.Provider>
    </SidePanelContainer>
  );
};
