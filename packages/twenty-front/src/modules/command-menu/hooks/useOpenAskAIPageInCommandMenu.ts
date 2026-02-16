import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenAskAIPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useRecoilValueV2(isCommandMenuOpenedStateV2);

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
