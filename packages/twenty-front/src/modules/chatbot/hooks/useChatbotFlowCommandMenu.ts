import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';
import { IconBolt } from 'twenty-ui/display';
import { chatbotIdComponentState } from '@/chatbot/state/chatbotIdComponentState';

export const useChatbotFlowCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openChatbotFlowCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (chatbotFlow: string) => {
        const pageId = v4();

        set(
          chatbotIdComponentState.atomFamily({ instanceId: pageId }),
          chatbotFlow,
        );

        navigateCommandMenu({
          page: CommandMenuPages.ChatbotFlow,
          pageTitle: t`Flow`,
          pageIcon: IconBolt,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  return {
    openChatbotFlowCommandMenu,
  };
};
