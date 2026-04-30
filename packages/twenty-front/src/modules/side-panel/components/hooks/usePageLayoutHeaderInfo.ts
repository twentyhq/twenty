import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { getCurrentGraphTypeFromConfig } from '@/side-panel/pages/page-layout/utils/getCurrentGraphTypeFromConfig';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconFrame,
  IconList,
  IconPlus,
  IconTable,
  type IconComponent,
  useIcons,
} from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type PageLayoutHeaderInfo = {
  headerIcon: IconComponent | undefined;
  headerIconColor: string;
  headerType: string;
  title: string;
  isReadonly: boolean;
  tab: PageLayoutTab | undefined;
  widgetInEditMode: PageLayoutWidget | undefined;
  isIconEditable: boolean;
  selectedIconKey: string | null;
};

type UsePageLayoutHeaderInfoParams = {
  sidePanelPage: SidePanelPages;
  draftPageLayout: {
    tabs: PageLayoutTab[];
  };
  pageLayoutEditingWidgetId: string | null | undefined;
  openTabId: string | null | undefined;
  editedTitle: string | null | undefined;
};

export const usePageLayoutHeaderInfo = ({
  sidePanelPage,
  draftPageLayout,
  pageLayoutEditingWidgetId,
  openTabId,
  editedTitle,
}: UsePageLayoutHeaderInfoParams): PageLayoutHeaderInfo | null => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const iconColor = theme.font.color.tertiary;

  switch (sidePanelPage) {
    case SidePanelPages.PageLayoutTabSettings: {
      if (!isDefined(openTabId)) {
        return null;
      }

      const tab = draftPageLayout.tabs.find((t) => t.id === openTabId);

      if (!isDefined(tab)) {
        return null;
      }

      const title = isDefined(editedTitle)
        ? editedTitle
        : isDefined(tab.title) && tab.title !== ''
          ? tab.title
          : '';

      const isCanvasTab = tab.layoutMode === PageLayoutTabLayoutMode.CANVAS;

      const resolvedTabIcon = isDefined(tab.icon)
        ? getIcon(tab.icon)
        : IconAppWindow;

      return {
        headerIcon: resolvedTabIcon ?? IconAppWindow,
        headerIconColor: iconColor,
        headerType: isCanvasTab ? t`Full tab widget` : t`Tab`,
        title,
        isReadonly: false,
        tab,
        widgetInEditMode: undefined,
        isIconEditable: true,
        selectedIconKey: tab.icon ?? null,
      };
    }

    case SidePanelPages.DashboardIframeSettings: {
      if (!isDefined(pageLayoutEditingWidgetId)) {
        return null;
      }

      const widgetInEditMode = draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId);

      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      const title = isDefined(editedTitle)
        ? editedTitle
        : isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '';

      return {
        headerIcon: IconFrame,
        headerIconColor: iconColor,
        headerType: t`iFrame Widget`,
        title,
        isReadonly: false,
        tab: undefined,
        widgetInEditMode,
        isIconEditable: false,
        selectedIconKey: null,
      };
    }

    case SidePanelPages.DashboardChartSettings: {
      if (!isDefined(pageLayoutEditingWidgetId)) {
        return null;
      }

      const widgetInEditMode = draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId);

      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      if (!isWidgetConfigurationOfTypeGraph(widgetInEditMode.configuration)) {
        return null;
      }

      const currentGraphType = getCurrentGraphTypeFromConfig(
        widgetInEditMode.configuration,
      );
      const graphTypeInfo = GRAPH_TYPE_INFORMATION[currentGraphType];

      const title = isDefined(editedTitle)
        ? editedTitle
        : isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '';

      return {
        headerIcon: graphTypeInfo.icon,
        headerIconColor: iconColor,
        headerType: t`Chart`,
        title,
        isReadonly: false,
        tab: undefined,
        widgetInEditMode,
        isIconEditable: false,
        selectedIconKey: null,
      };
    }

    case SidePanelPages.RecordPageFieldsSettings: {
      if (!isDefined(pageLayoutEditingWidgetId)) {
        return null;
      }

      const widgetInEditMode = draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId);

      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      const title = isDefined(editedTitle)
        ? editedTitle
        : isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '';

      return {
        headerIcon: IconList,
        headerIconColor: iconColor,
        headerType: t`Fields Widget`,
        title,
        isReadonly: false,
        tab: undefined,
        widgetInEditMode,
        isIconEditable: false,
        selectedIconKey: null,
      };
    }

    case SidePanelPages.RecordPageFieldSettings: {
      if (!isDefined(pageLayoutEditingWidgetId)) {
        return null;
      }

      const widgetInEditMode = draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId);

      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      const title = isDefined(editedTitle)
        ? editedTitle
        : isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '';

      return {
        headerIcon: IconList,
        headerIconColor: iconColor,
        headerType: t`Field Widget`,
        title,
        isReadonly: false,
        tab: undefined,
        widgetInEditMode,
        isIconEditable: false,
        selectedIconKey: null,
      };
    }

    case SidePanelPages.DashboardRecordTableSettings: {
      if (!isDefined(pageLayoutEditingWidgetId)) {
        return null;
      }

      const widgetInEditMode = draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId);

      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      const title = isDefined(editedTitle)
        ? editedTitle
        : isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '';

      return {
        headerIcon: IconTable,
        headerIconColor: iconColor,
        headerType: t`View`,
        title,
        isReadonly: false,
        tab: undefined,
        widgetInEditMode,
        isIconEditable: false,
        selectedIconKey: null,
      };
    }

    case SidePanelPages.PageLayoutDashboardWidgetTypeSelect: {
      return {
        headerIcon: IconPlus,
        headerIconColor: iconColor,
        headerType: '',
        title: t`New widget`,
        isReadonly: true,
        tab: undefined,
        widgetInEditMode: undefined,
        isIconEditable: false,
        selectedIconKey: null,
      };
    }

    case SidePanelPages.PageLayoutRecordPageWidgetTypeSelect: {
      return {
        headerIcon: IconPlus,
        headerIconColor: iconColor,
        headerType: '',
        title: t`New widget`,
        isReadonly: true,
        tab: undefined,
        widgetInEditMode: undefined,
        isIconEditable: false,
        selectedIconKey: null,
      };
    }
    default:
      return null;
  }
};
