import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableFrontComponentIdComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CommandMenuPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenFrontComponentInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const openFrontComponentInCommandMenu = ({
    frontComponentId,
    pageTitle,
    pageIcon,
    resetNavigationStack = false,
  }: {
    frontComponentId: string;
    pageTitle: string;
    pageIcon: IconComponent;
    resetNavigationStack?: boolean;
  }) => {
    const pageComponentInstanceId = v4();

    jotaiStore.set(
      viewableFrontComponentIdComponentState.atomFamily({
        instanceId: pageComponentInstanceId,
      }),
      frontComponentId,
    );

    navigateCommandMenu({
      page: CommandMenuPages.ViewFrontComponent,
      pageTitle,
      pageIcon,
      pageId: pageComponentInstanceId,
      resetNavigationStack,
    });
  };

  return {
    openFrontComponentInCommandMenu,
  };
};
