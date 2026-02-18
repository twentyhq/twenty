import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { t } from '@lingui/core/macro';
import { WidgetType } from '~/generated-metadata/graphql';

export const useEditPageLayoutWidget = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const setPageLayoutEditingWidgetId = useSetRecoilComponentState(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();
  const { closeCommandMenu } = useCommandMenu();
  const setCommandMenuPage = useSetRecoilState(commandMenuPageState);

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
        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutIframeSettings,
          pageTitle: t`Edit iFrame`,
          resetNavigationStack: true,
        });
        return;
      }

      if (widgetType === WidgetType.GRAPH) {
        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutGraphTypeSelect,
          pageTitle: t`Edit Graph`,
          resetNavigationStack: true,
        });
        return;
      }

      if (widgetType === WidgetType.FIELDS) {
        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutFieldsSettings,
          pageTitle: t`Edit Fields`,
          resetNavigationStack: true,
        });
        return;
      }

      setCommandMenuPage(CommandMenuPages.Root);
      closeCommandMenu();
    },
    [
      setPageLayoutEditingWidgetId,
      navigatePageLayoutCommandMenu,
      closeCommandMenu,
      setCommandMenuPage,
    ],
  );

  return {
    handleEditWidget,
  };
};
