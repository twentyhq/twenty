import { selectedChatState } from '@/chat/call-center/state/selectedChatState';
import { ticketIdComponentState } from '@/chat/call-center/state/ticketIdComponentState';
import { WhatsappDocument } from '@/chat/types/WhatsappDocument';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { IconBolt } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useCommandMenuTicket = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const setChat = useSetRecoilState(selectedChatState);

  const openCommandMenuTicket = useRecoilCallback(
    ({ set }) => {
      return (chat: WhatsappDocument) => {
        const pageId = v4();

        const chatId = `${chat.integrationId}_${chat.client.phone}`;

        setChat(chat);

        set(ticketIdComponentState.atomFamily({ instanceId: pageId }), chatId);

        navigateCommandMenu({
          page: CommandMenuPages.Ticket,
          pageTitle: t`Ticket`,
          pageIcon: IconBolt,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  return {
    openCommandMenuTicket,
  };
};
