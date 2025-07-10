import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenAskAIPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const openAskAIPage = () => {
    navigateCommandMenu({
      page: CommandMenuPages.AskAI,
      pageTitle: t`Ask AI`,
      pageIcon: IconSparkles,
      pageId: v4(),
    });
  };

  return {
    openAskAIPage,
  };
};
