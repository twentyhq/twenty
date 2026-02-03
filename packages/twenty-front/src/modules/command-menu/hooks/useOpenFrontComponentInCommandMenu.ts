import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableFrontComponentIdComponentState } from '@/command-menu/pages/front-component/states/viewableFrontComponentIdComponentState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilCallback } from 'recoil';
import { type IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenFrontComponentInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const openFrontComponentInCommandMenu = useRecoilCallback(
    ({ set }) =>
      ({
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

        set(
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
      },
    [navigateCommandMenu],
  );

  return {
    openFrontComponentInCommandMenu,
  };
};
