import { useFirestoreDb } from '@/chat/call-center/hooks/useFirestoreDb';
import {
  ChatStatus,
  statusEnum,
  WhatsappDocument,
} from '@/chat/types/WhatsappDocument';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import {
  and,
  collection,
  onSnapshot,
  or,
  query,
  where,
} from 'firebase/firestore';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface getRealTimeChatsArgs {
  integrationIds: string[];
  status: statusEnum;
  setChats: Dispatch<SetStateAction<WhatsappDocument[]>>; // | FacebookDocument[]
  activeTabId: string | null;
  agent?: Agent;
  sectors?: string[];
  platform: 'whatsapp' | 'messenger';
}

export const useRealTimeChats = ({
  integrationIds,
  status,
  activeTabId,
  agent,
  sectors,
  setChats,
  platform,
}: getRealTimeChatsArgs) => {
  const { firestoreDb } = useFirestoreDb();

  useEffect(() => {
    if (integrationIds.length === 0) return;

    const collectionName = platform === 'whatsapp' ? 'whatsapp' : 'messenger';

    let chatsQuery;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (agent?.isAdmin) {
      if (integrationIds.length > 0) {
        chatsQuery = query(
          collection(firestoreDb, collectionName),
          and(
            where('integrationId', 'in', integrationIds),
            or(
              where('status', '==', status),
              where('status', '==', statusEnum.OnHold),
              where('status', '==', statusEnum.Resolved),
            ),
          ),
        );
      }
    } else {
      if (activeTabId === ChatStatus.Mine) {
        if (integrationIds.length > 0) {
          chatsQuery = query(
            collection(firestoreDb, collectionName),
            and(
              where('integrationId', 'in', integrationIds),
              or(
                where('status', '==', status),
                where('status', '==', statusEnum.OnHold),
                where('status', '==', statusEnum.Resolved),
              ),
              where('agent', '==', agent?.id || ''),
            ),
          );
        }
      } else {
        // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
        if (integrationIds.length > 0 && sectors && sectors.length > 0) {
          chatsQuery = query(
            collection(firestoreDb, collectionName),
            and(
              where('integrationId', 'in', integrationIds),
              or(
                where('status', '==', status),
                where('status', '==', statusEnum.Resolved),
              ),
              or(
                where('sector', 'in', sectors),
                where('sector', '==', 'empty'),
              ),
              or(
                where('agent', '==', 'empty'),
                where('status', '==', statusEnum.Resolved),
              ),
            ),
          );
        }
      }
    }

    if (!chatsQuery) return;

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chats = snapshot.docs.map(
        (doc: any) => doc.data() as WhatsappDocument,
      );

      // const chats = snapshot.docs.map((doc) =>
      //   platform === 'whatsapp'
      //     ? (doc.data() as WhatsappDocument)
      //     : (doc.data() as FacebookDocument),
      // );

      setChats(chats);
    });

    return () => unsubscribe();
  }, [integrationIds, status, activeTabId, setChats, platform, agent?.isAdmin]);
};
