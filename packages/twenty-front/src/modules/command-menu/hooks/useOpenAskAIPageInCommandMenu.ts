import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { IconSparkles } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenAskAIPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const openAskAIPage = useRecoilCallback(
    ({ snapshot }) =>
      ({
        resetNavigationStack,
      }: {
        resetNavigationStack?: boolean;
      } = {}) => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        const shouldReset =
          resetNavigationStack !== undefined
            ? resetNavigationStack
            : isCommandMenuOpened;

        navigateCommandMenu({
          page: CommandMenuPages.AskAI,
          pageTitle: t`Ask AI`,
          pageIcon: IconSparkles,
          pageId: v4(),
          resetNavigationStack: shouldReset,
        });
      },
    [navigateCommandMenu],
  );

  return {
    openAskAIPage,
  };
};
