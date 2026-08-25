import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isViewportFillingWidgetType } from '@/page-layout/widgets/utils/isViewportFillingWidgetType';
import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { getCurrentGraphTypeFromConfig } from '@/side-panel/pages/page-layout/utils/getCurrentGraphTypeFromConfig';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconFrame,
  IconLayoutDashboard,
  IconList,
  IconPlus,
  IconTable,
  type IconComponent,
  useIcons,
} from 'twenty-ui/icon';
import { ThemeContext } from 'twenty-ui/theme-constants';

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

type GetPageLayoutWidgetHeaderInfoParams = {
  editedTitle: string | null | undefined;
  headerIcon: IconComponent | undefined;
  headerIconColor: string;
  headerType: string;
  widgetInEditMode: PageLayoutWidget;
};

const getPageLayoutWidgetHeaderInfo = ({
  editedTitle,
  headerIcon,
  headerIconColor,
  headerType,
  widgetInEditMode,
}: GetPageLayoutWidgetHeaderInfoParams): PageLayoutHeaderInfo => ({
  headerIcon,
  headerIconColor,
  headerType,
  title: isDefined(editedTitle)
    ? editedTitle
    : isNonEmptyString(widgetInEditMode.title)
      ? widgetInEditMode.title
      : '',
  isReadonly: false,
  tab: undefined,
  widgetInEditMode,
  isIconEditable: false,
  selectedIconKey: null,
});

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

  const widgetInEditMode = isDefined(pageLayoutEditingWidgetId)
    ? draftPageLayout.tabs
        .flatMap((tab) => tab.widgets)
        .find((widget) => widget.id === pageLayoutEditingWidgetId)
    : undefined;

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

      const resolvedTabIcon = isDefined(tab.icon)
        ? getIcon(tab.icon)
        : IconAppWindow;

      return {
        headerIcon: resolvedTabIcon ?? IconAppWindow,
        headerIconColor: iconColor,
        headerType: t`Tab`,
        title,
        isReadonly: false,
        tab,
        widgetInEditMode: undefined,
        isIconEditable: true,
        selectedIconKey: tab.icon ?? null,
      };
    }

    case SidePanelPages.PageLayoutWidgetSettings: {
      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      return getPageLayoutWidgetHeaderInfo({
        editedTitle,
        headerIcon: IconLayoutDashboard,
        headerIconColor: iconColor,
        headerType: isViewportFillingWidgetType(widgetInEditMode.type)
          ? t`Full-height Widget`
          : t`Widget`,
        widgetInEditMode,
      });
    }

    case SidePanelPages.DashboardIframeSettings: {
      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      return getPageLayoutWidgetHeaderInfo({
        editedTitle,
        headerIcon: IconFrame,
        headerIconColor: iconColor,
        headerType: t`iFrame Widget`,
        widgetInEditMode,
      });
    }

    case SidePanelPages.DashboardChartSettings: {
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

      return getPageLayoutWidgetHeaderInfo({
        editedTitle,
        headerIcon: graphTypeInfo.icon,
        headerIconColor: iconColor,
        headerType: t`Chart`,
        widgetInEditMode,
      });
    }

    case SidePanelPages.RecordPageFieldsSettings: {
      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      return getPageLayoutWidgetHeaderInfo({
        editedTitle,
        headerIcon: IconList,
        headerIconColor: iconColor,
        headerType: t`Fields Widget`,
        widgetInEditMode,
      });
    }

    case SidePanelPages.RecordPageFieldSettings: {
      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      return getPageLayoutWidgetHeaderInfo({
        editedTitle,
        headerIcon: IconList,
        headerIconColor: iconColor,
        headerType: t`Field Widget`,
        widgetInEditMode,
      });
    }

    case SidePanelPages.DashboardRecordTableSettings: {
      if (!isDefined(widgetInEditMode)) {
        return null;
      }

      return getPageLayoutWidgetHeaderInfo({
        editedTitle,
        headerIcon: IconTable,
        headerIconColor: iconColor,
        headerType: t`View`,
        widgetInEditMode,
      });
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
