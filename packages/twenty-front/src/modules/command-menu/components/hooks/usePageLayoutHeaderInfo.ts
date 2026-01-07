import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { getCurrentGraphTypeFromConfig } from '@/command-menu/pages/page-layout/utils/getCurrentGraphTypeFromConfig';
import { isWidgetConfigurationOfTypeGraph } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconFrame,
  IconPlus,
  type IconComponent,
} from 'twenty-ui/display';

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
  commandMenuPage: CommandMenuPages;
  draftPageLayout: {
    tabs: PageLayoutTab[];
  };
  pageLayoutEditingWidgetId: string | null | undefined;
  openTabId: string | null | undefined;
  editedTitle: string | null | undefined;
};

export const usePageLayoutHeaderInfo = ({
  commandMenuPage,
  draftPageLayout,
  pageLayoutEditingWidgetId,
  openTabId,
  editedTitle,
}: UsePageLayoutHeaderInfoParams): PageLayoutHeaderInfo | null => {
  const theme = useTheme();
  const iconColor = theme.font.color.tertiary;

  switch (commandMenuPage) {
    case CommandMenuPages.PageLayoutTabSettings: {
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

    case CommandMenuPages.PageLayoutIframeSettings: {
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

    case CommandMenuPages.PageLayoutGraphTypeSelect:
    case CommandMenuPages.PageLayoutGraphFilter: {
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
        commandMenuPage === CommandMenuPages.PageLayoutGraphFilter
          ? t`${graphTypeLabel} Chart`
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
        isReadonly: commandMenuPage === CommandMenuPages.PageLayoutGraphFilter,
        tab: undefined,
        widgetInEditMode,
      };
    }

    case CommandMenuPages.PageLayoutWidgetTypeSelect: {
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
