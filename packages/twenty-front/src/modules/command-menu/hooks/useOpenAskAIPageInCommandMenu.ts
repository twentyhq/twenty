import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenAskAIPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const openAskAIPage = (pageTitle?: string | null) => {
    navigateCommandMenu({
      page: CommandMenuPages.AskAI,
      pageTitle: pageTitle ?? t`Ask AI`,
      pageIcon: IconSparkles,
      pageId: v4(),
    });
  };

  return {
    openAskAIPage,
  };
};
