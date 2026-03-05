import { useCallback } from 'react';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { SidePanelPages } from 'twenty-shared/types';

import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { WidgetType } from '~/generated-metadata/graphql';

export const useEditPageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const setPageLayoutEditingWidgetId = useSetAtomComponentState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const setSidePanelPage = useSetAtomState(sidePanelPageState);

  const handleEditWidget = useCallback(
    ({
      widgetId,
      widgetType,
    }: {
      widgetId: string;
      widgetType: WidgetType;
    }) => {
      setPageLayoutEditingWidgetId(widgetId);

      if (widgetType === WidgetType.IFRAME) {
        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.PageLayoutIframeSettings,
          pageTitle: t`Edit iFrame`,
          resetNavigationStack: true,
        });
        return;
      }

      if (widgetType === WidgetType.GRAPH) {
        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.PageLayoutGraphTypeSelect,
          pageTitle: t`Edit Graph`,
          resetNavigationStack: true,
        });
        return;
      }

      if (widgetType === WidgetType.FIELDS) {
        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.PageLayoutFieldsSettings,
          pageTitle: t`Edit Fields`,
          resetNavigationStack: true,
        });
        return;
      }

      setSidePanelPage(SidePanelPages.Root);
      closeSidePanelMenu();
    },
    [
      setPageLayoutEditingWidgetId,
      navigatePageLayoutSidePanel,
      closeSidePanelMenu,
      setSidePanelPage,
    ],
  );

  return {
    handleEditWidget,
  };
};
