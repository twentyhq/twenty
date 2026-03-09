import { GRAPH_TYPE_INFORMATION } from '@/side-panel/pages/page-layout/constants/GraphTypeInformation';
import { getCurrentGraphTypeFromConfig } from '@/side-panel/pages/page-layout/utils/getCurrentGraphTypeFromConfig';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconFrame,
  IconList,
  IconPlus,
  type IconComponent,
} from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';

type PageLayoutHeaderInfo = {
  headerIcon: IconComponent | undefined;
  headerIconColor: string;
  headerType: string;
  title: string;
  isReadonly: boolean;
  tab: PageLayoutTab | undefined;
  widgetInEditMode: PageLayoutWidget | undefined;
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

      return {
        headerIcon: IconAppWindow,
        headerIconColor: iconColor,
        headerType: t`Tab`,
        title,
        isReadonly: false,
        tab,
        widgetInEditMode: undefined,
      };
    }

    case SidePanelPages.PageLayoutIframeSettings: {
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
      };
    }

    case SidePanelPages.PageLayoutGraphTypeSelect:
    case SidePanelPages.PageLayoutGraphFilter: {
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
      const graphTypeLabel = t(graphTypeInfo.label);

      const headerType =
        sidePanelPage === SidePanelPages.PageLayoutGraphFilter
          ? graphTypeLabel
          : t`Chart`;

      const title = isDefined(editedTitle)
        ? editedTitle
        : isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '';

      return {
        headerIcon: graphTypeInfo.icon,
        headerIconColor: iconColor,
        headerType,
        title,
        isReadonly: sidePanelPage === SidePanelPages.PageLayoutGraphFilter,
        tab: undefined,
        widgetInEditMode,
      };
    }

    case SidePanelPages.PageLayoutFieldsSettings:
    case SidePanelPages.PageLayoutFieldsLayout: {
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
      };
    }

    case SidePanelPages.PageLayoutWidgetTypeSelect: {
      return {
        headerIcon: IconPlus,
        headerIconColor: iconColor,
        headerType: '',
        title: t`New widget`,
        isReadonly: true,
        tab: undefined,
        widgetInEditMode: undefined,
      };
    }
    default:
      return null;
  }
};
