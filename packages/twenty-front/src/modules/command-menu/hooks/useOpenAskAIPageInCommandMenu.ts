import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { IconSparkles } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenAskAIPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const openAskAIPage = useRecoilCallback(
    ({ snapshot }) =>
      ({
        pageTitle,
        resetNavigationStack,
      }: {
        pageTitle?: string | null;
        resetNavigationStack?: boolean;
      } = {}) => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        const currentAIChatThreadTitle = snapshot
          .getLoadable(currentAIChatThreadTitleState)
          .getValue();

        const shouldReset =
          resetNavigationStack !== undefined
            ? resetNavigationStack
            : isCommandMenuOpened;

        const resolvedTitle = isNonEmptyString(pageTitle)
          ? pageTitle
          : isNonEmptyString(currentAIChatThreadTitle)
            ? currentAIChatThreadTitle
            : t`Ask AI`;

        navigateCommandMenu({
          page: CommandMenuPages.AskAI,
          pageTitle: resolvedTitle,
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
