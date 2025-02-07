/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { firestoreDB } from '@/chat/internal/config/FirebaseConfig';
import { UnreadMessages } from '@/chat/types/MessageType';
import { statusEnum, WhatsappDocument } from '@/chat/types/WhatsappDocument';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface getTabUnreadMessagesArgs {
  integrationWhatsappIds: string[];
  // integrationMessengerIds: string[];
  setUnreadTabMessages: Dispatch<SetStateAction<UnreadMessages | null>>;
  agent: string | undefined;
}

export const useGetTabUnreadMessages = ({
  integrationWhatsappIds,
  // integrationMessengerIds,
  setUnreadTabMessages,
  agent,
}: getTabUnreadMessagesArgs) => {
  useEffect(() => {
    if (integrationWhatsappIds.length === 0) {
      // && integrationMessengerIds.length === 0
      return;
    }

    const processUnreadMessages = (chats: WhatsappDocument[]) => {
      // | FacebookDocument
      const unreadMine = chats
        .filter(
          (chat) =>
            chat.status === statusEnum.InProgress && chat.agent === agent,
        )
        .map((chat) => chat.unreadMessages || 0);

      const unreadUnassigned = chats
        .filter((chat) => chat.status === statusEnum.Waiting)
        .map((chat) => chat.unreadMessages || 0);

      const unreadAbandoned = chats
        .filter((chat) => chat.status === statusEnum.Pending)
        .map((chat) => chat.unreadMessages || 0);

      return {
        unreadMine: unreadMine.reduce(
          (acc, unreadMessages) => acc + unreadMessages,
          0,
        ),
        unreadUnassigned: unreadUnassigned.reduce(
          (acc, unreadMessages) => acc + unreadMessages,
          0,
        ),
        unreadAbandoned: unreadAbandoned.reduce(
          (acc, unreadMessages) => acc + unreadMessages,
          0,
        ),
      };
    };

    let unsubscribeWhatsapp: () => void = () => {};
    // let unsubscribeMessenger: () => void = () => {};

    if (integrationWhatsappIds.length > 0) {
      const waQuery = query(
        collection(firestoreDB, 'whatsapp'),
        where('integrationId', 'in', integrationWhatsappIds),
      );

      unsubscribeWhatsapp = onSnapshot(waQuery, (snapshot) => {
        const chats = snapshot.docs.map(
          (doc) => doc.data() as WhatsappDocument,
        );
        const unreadMessagesWhatsapp = processUnreadMessages(chats);

        setUnreadTabMessages({
          unreadMine: unreadMessagesWhatsapp.unreadMine,
          unreadUnassigned: unreadMessagesWhatsapp.unreadUnassigned,
          unreadAbandoned: unreadMessagesWhatsapp.unreadAbandoned,
        });

        // if (integrationMessengerIds.length > 0) {
        //   unsubscribeMessenger = onSnapshot(
        //     query(
        //       collection(firestoreDB, 'messenger'),
        //       where('integrationId', 'in', integrationMessengerIds),
        //     ),
        //     (snapshot) => {
        //       const chats = snapshot.docs.map(
        //         (doc) => doc.data() as FacebookDocument,
        //       );
        //       const unreadMessagesMessenger = processUnreadMessages(chats);

        //       setUnreadTabMessages({
        //         unreadMine:
        //           unreadMessagesWhatsapp.unreadMine +
        //           unreadMessagesMessenger.unreadMine,
        //         unreadUnassigned:
        //           unreadMessagesWhatsapp.unreadUnassigned +
        //           unreadMessagesMessenger.unreadUnassigned,
        //         unreadAbandoned:
        //           unreadMessagesWhatsapp.unreadAbandoned +
        //           unreadMessagesMessenger.unreadAbandoned,
        //       });
        //     },
        //   );
        // } else {
        //   setUnreadTabMessages({
        //     unreadMine: unreadMessagesWhatsapp.unreadMine,
        //     unreadUnassigned: unreadMessagesWhatsapp.unreadUnassigned,
        //     unreadAbandoned: unreadMessagesWhatsapp.unreadAbandoned,
        //   });
        // }
      });
    }

    // if (integrationMessengerIds.length > 0) {
    //   const fbQuery = query(
    //     collection(firestoreDB, 'messenger'),
    //     where('integrationId', 'in', integrationMessengerIds),
    //   );

    //   unsubscribeMessenger = onSnapshot(fbQuery, (snapshot) => {
    //     const chats = snapshot.docs.map(
    //       (doc) => doc.data() as FacebookDocument,
    //     );
    //     const unreadMessagesMessenger = processUnreadMessages(chats);

    //     setUnreadTabMessages({
    //       unreadMine: unreadMessagesMessenger.unreadMine,
    //       unreadUnassigned: unreadMessagesMessenger.unreadUnassigned,
    //       unreadAbandoned: unreadMessagesMessenger.unreadAbandoned,
    //     });
    //   });
    // }

    return () => {
      if (unsubscribeWhatsapp) {
        unsubscribeWhatsapp();
      }

      // if (unsubscribeMessenger) {
      //   unsubscribeMessenger();
      // }
    };
  }, [
    integrationWhatsappIds,
    // integrationMessengerIds,
    agent,
    setUnreadTabMessages,
  ]);
};
