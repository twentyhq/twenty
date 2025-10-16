import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/display';

export const useOpenAskAIPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const openAskAIPage = (pageTitle?: string | null) => {
    navigateCommandMenu({
      page: CommandMenuPages.AskAI,
      pageTitle: pageTitle ?? t`Ask AI`,
      pageIcon: IconSparkles,
      pageId: crypto.randomUUID(),
    });
  };

  return {
    openAskAIPage,
  };
};
