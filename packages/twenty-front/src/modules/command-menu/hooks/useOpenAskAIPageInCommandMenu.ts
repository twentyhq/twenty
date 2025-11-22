import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { IconSparkles } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenAskAIPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

  const openAskAIPage = ({
    pageTitle,
    resetNavigationStack,
  }: {
    pageTitle?: string | null;
    resetNavigationStack?: boolean;
  } = {}) => {
    const shouldReset =
      resetNavigationStack !== undefined
        ? resetNavigationStack
        : isCommandMenuOpened;

    navigateCommandMenu({
      page: CommandMenuPages.AskAI,
      pageTitle: pageTitle ?? t`Ask AI`,
      pageIcon: IconSparkles,
      pageId: v4(),
      resetNavigationStack: shouldReset,
    });
  };

  return {
    openAskAIPage,
  };
};
