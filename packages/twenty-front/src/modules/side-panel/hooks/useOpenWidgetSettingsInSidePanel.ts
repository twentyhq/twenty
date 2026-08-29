import { useCallback } from 'react';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getIsSingleWidgetTab } from '@/page-layout/utils/getIsSingleWidgetTab';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useIsDashboardPageLayout } from '@/side-panel/pages/page-layout/hooks/useIsDashboardPageLayout';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

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

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const openWidgetSettingsInSidePanel = useCallback(
    ({
      widgetId,
      widgetType,
    }: {
      widgetId: string;
      widgetType: WidgetType;
    }) => {
      if (widgetType === WidgetType.IFRAME && isDashboardPageLayout) {
        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.DashboardIframeSettings,
          pageTitle: t`Edit iFrame`,
          resetNavigationStack: true,
        });
        setPageLayoutEditingWidgetId(widgetId);
        return;
      }

      if (widgetType === WidgetType.GRAPH && isDashboardPageLayout) {
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

      if (widgetType === WidgetType.RECORD_TABLE && isDashboardPageLayout) {
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

      const containingTab = pageLayoutDraft.tabs.find((tab) =>
        tab.widgets.some((w) => w.id === widgetId),
      );

      const isContainingTabSingleWidget =
        isDefined(containingTab) &&
        getIsSingleWidgetTab({ tab: containingTab });

      const isViewportFillingWidgetInVerticalList =
        isDefined(containingTab) &&
        containingTab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
        isViewportFillingWidgetType(widgetType);

      if (
        isContainingTabSingleWidget &&
        !isViewportFillingWidgetInVerticalList
      ) {
        setPageLayoutTabSettingsOpenTabId(containingTab.id);
        navigatePageLayoutSidePanel({
          sidePanelPage: SidePanelPages.PageLayoutTabSettings,
          resetNavigationStack: true,
        });
        return;
      }

      setPageLayoutEditingWidgetId(widgetId);
      navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutWidgetSettings,
        resetNavigationStack: true,
      });
    },
    [
      isDashboardPageLayout,
      pageLayoutDraft,
      setPageLayoutEditingWidgetId,
      setPageLayoutTabSettingsOpenTabId,
      navigatePageLayoutSidePanel,
      closeSidePanelMenu,
    ],
  );

  return {
    openWidgetSettingsInSidePanel,
  };
};
