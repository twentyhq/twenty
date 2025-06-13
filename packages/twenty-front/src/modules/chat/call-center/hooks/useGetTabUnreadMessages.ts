/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { useFirestoreDb } from '@/chat/call-center/hooks/useFirestoreDb';
import { UnreadMessages } from '@/chat/types/MessageType';
import { statusEnum, WhatsappDocument } from '@/chat/types/WhatsappDocument';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface GetTabUnreadMessagesArgs {
  integrationWhatsappIds: string[];
  // integrationMessengerIds: string[];
  setUnreadTabMessages: Dispatch<SetStateAction<UnreadMessages | null>>;
  agent: string | undefined;
}

interface GetTabUnreadMessagesArgs {
  integrationWhatsappIds: string[];
  setUnreadTabMessages: Dispatch<SetStateAction<UnreadMessages | null>>;
  agent: string | undefined;
}

export const useGetTabUnreadMessages = ({
  integrationWhatsappIds,
  setUnreadTabMessages,
  agent,
}: GetTabUnreadMessagesArgs) => {
  const { firestoreDb } = useFirestoreDb();

  useEffect(() => {
    if (integrationWhatsappIds.length === 0) return;

    const countChatsByStatus = (chats: WhatsappDocument[]) => {
      const countMine = chats.filter(
        (chat) => chat.status === statusEnum.InProgress && chat.agent === agent,
      ).length;

      const countUnassigned = chats.filter(
        (chat) => chat.status === statusEnum.Waiting,
      ).length;

      const countAbandoned = chats.filter(
        (chat) => chat.status === statusEnum.Pending,
      ).length;

      return {
        unreadMine: countMine,
        unreadUnassigned: countUnassigned,
        unreadAbandoned: countAbandoned,
      };
    };

    const waQuery = query(
      collection(firestoreDb, 'whatsapp'),
      where('integrationId', 'in', integrationWhatsappIds),
    );

    const unsubscribe = onSnapshot(waQuery, (snapshot) => {
      const chats = snapshot.docs.map((doc) => doc.data() as WhatsappDocument);

      const counts = countChatsByStatus(chats);

      setUnreadTabMessages(counts);
    });

    return () => unsubscribe();
  }, [integrationWhatsappIds, agent, setUnreadTabMessages, firestoreDb]);
};
