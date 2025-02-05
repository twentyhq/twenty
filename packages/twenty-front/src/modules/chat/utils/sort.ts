import { WhatsappDocument } from '@/chat/types/WhatsappDocument';

export const sort = (whatsappChats: WhatsappDocument[]) => {
  return [...whatsappChats]?.sort((a, b) => {
    return (
      new Date(b.lastMessage.createdAt.toDate()).getTime() -
      new Date(a.lastMessage.createdAt.toDate()).getTime()
    );
  });
};
