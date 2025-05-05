import { chatbotIdComponentState } from '@/chatbot/state/chatbotIdComponentState';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { Node } from '@xyflow/react';
import { useRecoilCallback } from 'recoil';
import { IconBolt, IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useChatbotFlowCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const openChatbotFlowCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (chatbotFlowId: string) => {
        const pageId = v4();

        set(
          chatbotIdComponentState.atomFamily({ instanceId: pageId }),
          chatbotFlowId,
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

  const openChatbotFlowStepEditCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (chatbotFlowId: string, title: string, icon: IconComponent) => {
        const pageId = v4();

        set(
          chatbotIdComponentState.atomFamily({ instanceId: pageId }),
          chatbotFlowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.ChatbotFlowStepEdit,
          pageTitle: title,
          pageIcon: icon,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  return {
    openChatbotFlowCommandMenu,
    openChatbotFlowStepEditCommandMenu,
  };
};
