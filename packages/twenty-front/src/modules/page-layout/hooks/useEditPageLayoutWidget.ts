import { useCallback } from 'react';

import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useOpenPageLayoutCommandMenu';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { WidgetType } from '~/generated/graphql';

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
          commandMenuPage: CommandMenuPages.PageLayoutIframeConfig,
          pageTitle: 'Edit iFrame',
        });
      }
    },
    [setPageLayoutEditingWidgetId, navigatePageLayoutCommandMenu],
  );

  return {
    handleEditWidget,
  };
};
