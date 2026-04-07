import { useCallback } from 'react';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useIsDashboardPageLayout } from '@/side-panel/pages/page-layout/hooks/useIsDashboardPageLayout';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

export const useOpenWidgetSettingsInSidePanel = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isDashboardPageLayout = useIsDashboardPageLayout();

  const setPageLayoutEditingWidgetId = useSetAtomComponentState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const setSidePanelPage = useSetAtomState(sidePanelPageState);

  const openWidgetSettingsInSidePanel = useCallback(
    ({
      widgetId,
      widgetType,
    }: {
      widgetId: string;
      widgetType: WidgetType;
    }) => {
      if (widgetType === WidgetType.IFRAME) {
        if (!isDashboardPageLayout) {
          return;
        }

        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.DashboardIframeSettings,
          pageTitle: t`Edit iFrame`,
          resetNavigationStack: true,
        });
        setPageLayoutEditingWidgetId(widgetId);
        return;
      }

      if (widgetType === WidgetType.GRAPH) {
        if (!isDashboardPageLayout) {
          return;
        }

        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.DashboardChartSettings,
          pageTitle: t`Edit Graph`,
          resetNavigationStack: true,
        });
        setPageLayoutEditingWidgetId(widgetId);
        return;
      }

      if (widgetType === WidgetType.FIELDS) {
        if (!isDashboardPageLayout) {
          navigatePageLayoutSidePanel({
            sidePanelPage: SidePanelPages.RecordPageFieldsSettings,
            pageTitle: t`Edit Fields`,
            resetNavigationStack: true,
          });
          setPageLayoutEditingWidgetId(widgetId);
        }
        return;
      }

      if (widgetType === WidgetType.FIELD) {
        if (!isDashboardPageLayout) {
          navigatePageLayoutSidePanel({
            sidePanelPage: SidePanelPages.RecordPageFieldSettings,
            pageTitle: t`Field widget`,
            resetNavigationStack: true,
          });
          setPageLayoutEditingWidgetId(widgetId);
        }
        return;
      }

      if (widgetType === WidgetType.RECORD_TABLE) {
        if (!isDashboardPageLayout) {
          return;
        }

        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.DashboardRecordTableSettings,
          pageTitle: t`Edit Record Table`,
          resetNavigationStack: true,
        });
        setPageLayoutEditingWidgetId(widgetId);
        return;
      }

      if (widgetType === WidgetType.STANDALONE_RICH_TEXT) {
        setPageLayoutEditingWidgetId(widgetId);
        closeSidePanelMenu();
        return;
      }

      setSidePanelPage(SidePanelPages.CommandMenuDisplay);
      closeSidePanelMenu();
    },
    [
      isDashboardPageLayout,
      setPageLayoutEditingWidgetId,
      navigatePageLayoutSidePanel,
      closeSidePanelMenu,
      setSidePanelPage,
    ],
  );

  return {
    openWidgetSettingsInSidePanel,
  };
};
