/* eslint-disable project-structure/folder-structure */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { createContext, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useGetTabUnreadMessages } from '@/chat/call-center/hooks/useGetTabUnreadMessages';
import { useRealTimeChats } from '@/chat/call-center/hooks/useRealTimeChats';
import { useSendWhatsappEventMessage } from '@/chat/call-center/hooks/useSendWhatsappEventMessage';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import {
  FilteredMessage,
  FilteredUser,
} from '@/chat/call-center/types/SearchType';
import { MessageEventType } from '@/chat/types/MessageEventType';
import { MessageType, UnreadMessages } from '@/chat/types/MessageType';
import {
  ChatStatus,
  WhatsappDocument,
  statusEnum,
} from '@/chat/types/WhatsappDocument';
import { isWhatsappDocument } from '@/chat/utils/isWhatsappDocument';
import { sort } from '@/chat/utils/sort';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindAllWhatsappIntegrations } from '@/settings/integrations/meta/whatsapp/hooks/useFindAllWhatsappIntegrations';
import { useFindAllAgents } from '@/settings/service-center/agents/hooks/useFindAllAgents';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

const ChatContext = createContext<CallCenterContextType | null>(null);

export const CallCenterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [whatsappChats, setWhatsappChats] = useState<WhatsappDocument[]>([]);
  // const [messengerChats, setMessengerChats] = useState<FacebookDocument[]>([]);
  const [unreadTabMessages, setUnreadTabMessages] =
    useState<UnreadMessages | null>(null);
  const [selectedChat, setSelectedChat] = useState<
    WhatsappDocument | undefined
  >(undefined); // | FacebookDocument
  const [isStartChatOpen, setIsStartChatOpen] = useState<boolean>(false);
  const [startChatNumber, setStartChatNumber] = useState<string | null>(null);
  const [startChatIntegrationId, setStartChatIntegrationId] = useState<
    string | null
  >(null);

  const { whatsappIntegrations, loading } = useFindAllWhatsappIntegrations();
  // const { messengerIntegrations, loading: loadingMessenger } =
  //   useGetAllMessengerIntegrations();

  const TAB_LIST_COMPONENT_ID = 'show-whats-page-side-tab-list';

  const [activeTabId, setActiveTabId] = useRecoilComponentStateV2(
    activeTabIdComponentState,
    TAB_LIST_COMPONENT_ID,
  );

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const currentMember = workspaceMembers?.find(
    (member) => member.id === currentWorkspaceMember?.id,
  );

  const { agents = [] } = useFindAllAgents();
  const agentIds = agents?.map((agent) => agent.id);
  const sectorIds = agents
    ?.find((agent) => agent.id === currentMember?.agentId)
    ?.sectors?.map((sector) => sector.id);

  const workspaceAgents: WorkspaceMember[] = workspaceMembers.filter(
    (member) =>
      agentIds?.includes(member.agentId) &&
      currentMember?.agentId !== member.agentId,
  );

  const integrationWhatsappIds = useMemo(
    () => (loading ? [] : whatsappIntegrations.map((wa) => wa.id)),
    [whatsappIntegrations, loading],
  );

  // const integrationMessengerIds = useMemo(
  //   () =>
  //     loadingMessenger
  //       ? []
  //       : messengerIntegrations.map((messenger) => messenger.id),
  //   [messengerIntegrations, loadingMessenger],
  // );

  const activeWhatsappIntegrations = useMemo(
    () => (loading ? [] : whatsappIntegrations.filter((wa) => !wa.disabled)),
    [whatsappIntegrations, loading],
  );

  const currentAgent = useMemo(() => {
    return agents.find((agent) => agent.id === currentMember?.agentId);
  }, [agents, currentMember]);

  const { sendWhatsappEventMessage } = useSendWhatsappEventMessage();
  // const { messengerEventMessage } = useMessengerEventMessage();

  useRealTimeChats({
    integrationIds: integrationWhatsappIds,
    status: (() => {
      switch (activeTabId) {
        case ChatStatus.Mine:
          return statusEnum.InProgress;
        case ChatStatus.Unassigned:
          return statusEnum.Waiting;
        case ChatStatus.Abandoned:
          return statusEnum.Pending;
        default:
          return statusEnum.InProgress;
      }
    })(),
    activeTabId,
    agent: currentAgent,
    sectors: sectorIds,
    platform: 'whatsapp',
    setChats: setWhatsappChats,
  });

  // useRealTimeChats({
  //   integrationIds: integrationMessengerIds,
  //   status: (() => {
  //     switch (activeTabId) {
  //       case ChatStatus.Mine:
  //         return statusEnum.InProgress;
  //       case ChatStatus.Unassigned:
  //         return statusEnum.Waiting;
  //       case ChatStatus.Abandoned:
  //         return statusEnum.Pending;
  //       default:
  //         return statusEnum.InProgress;
  //     }
  //   })(),
  //   activeTabId,
  //   agent: currentAgent,
  //   sectors: sectorIds,
  //   platform: 'messenger',
  //   setChats: setMessengerChats,
  // });

  useGetTabUnreadMessages({
    integrationWhatsappIds,
    // integrationMessengerIds,
    setUnreadTabMessages,
    agent: currentMember?.agentId,
  });

  useEffect(() => {
    if (selectedChatId === null) return;

    const whatsappChat = whatsappChats.find(
      (chat) => `${chat.integrationId}_${chat.client.phone}` === selectedChatId,
    );

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (whatsappChat) {
      setSelectedChat(whatsappChat);
      return;
    }

    // const messengerChat = messengerChats.find(
    //   (chat) => `${chat.integrationId}_${chat.client.id}` === selectedChatId,
    // );

    // if (messengerChat) {
    //   setSelectedChat(messengerChat);
    // }
  }, [selectedChatId, whatsappChats]);

  const sortChats = () => {
    setWhatsappChats(sort(whatsappChats));
  };

  const startService = () => {
    const today = new Date();

    // const platformSpecificMessage = isWhatsappDocument(selectedChat)
    //   ? sendEventMessage
    //   : messengerEventMessage;
    const platformSpecificMessage = sendWhatsappEventMessage;

    platformSpecificMessage({
      agent: {
        id: currentMember?.agentId,
        name: `${currentMember?.name.firstName} ${currentMember?.name.lastName}`,
      },
      eventStatus: MessageType.STARTED,
      status: statusEnum.InProgress,
      from:
        `${currentMember?.name.firstName} ${currentMember?.name.lastName}` ||
        'system',
      integrationId: selectedChat?.integrationId || '',
      to: isWhatsappDocument(selectedChat)
        ? (selectedChat?.client.phone ?? '')
        : 'Name not available',
      // to: isWhatsappDocument(selectedChat)
      // ? (selectedChat?.client.phone ?? '')
      // : (selectedChat?.client.id ?? ''),
      type: MessageType.STARTED,
      message: `${currentMember?.name.firstName} ${currentMember?.name.lastName} ${MessageEventType.STARTED} (${today.toISOString().split('T')[0].replaceAll('-', '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`,
    });

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (selectedChat) {
      const chatId = `${selectedChat.integrationId}_${selectedChat.client.phone}`;
      setSelectedChatId(chatId);
    }

    setActiveTabId('mine');
  };

  const finalizeService = () => {
    const today = new Date();

    // const platformSpecificMessage = isWhatsappDocument(selectedChat)
    //   ? sendEventMessage
    //   : messengerEventMessage;
    const platformSpecificMessage = sendWhatsappEventMessage;

    platformSpecificMessage({
      agent: {
        id: currentMember?.agentId,
        name: `${currentMember?.name.firstName} ${currentMember?.name.lastName}`,
      },
      eventStatus: MessageType.END,
      status: statusEnum.Resolved,
      from:
        `${currentMember?.name.firstName} ${currentMember?.name.lastName}` ||
        'system',
      integrationId: selectedChat?.integrationId || '',
      to: isWhatsappDocument(selectedChat)
        ? (selectedChat?.client.phone ?? '')
        : 'Name not available',
      type: MessageType.END,
      message: `${currentMember?.name.firstName} ${currentMember?.name.lastName} ${MessageEventType.END} (${today.toISOString().split('T')[0].replaceAll('-', '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`,
    });
  };

  const transferService = (agent?: WorkspaceMember, sector?: Sector) => {
    // const platformSpecificMessage = isWhatsappDocument(selectedChat)
    //   ? sendEventMessageb
    //   : messengerEventMessage;

    const platformSpecificMessage = sendWhatsappEventMessage;

    const to = agent
      ? `${agent.name.firstName} ${agent.name.lastName}`
      : sector?.name;

    const agentOrSector = agent
      ? {
          id: agent.agentId,
          name: `${agent?.name.firstName} ${agent?.name.lastName}`,
        }
      : {
          id: sector?.id,
          name: sector?.name,
        };

    const today = new Date();

    platformSpecificMessage({
      [agent ? 'agent' : 'sector']: agentOrSector,
      eventStatus: MessageType.TRANSFER,
      status: agent ? statusEnum.InProgress : statusEnum.Waiting,
      from:
        `${currentMember?.name.firstName} ${currentMember?.name.lastName}` ||
        'system',
      integrationId: selectedChat?.integrationId || '',
      to: isWhatsappDocument(selectedChat)
        ? (selectedChat?.client.phone ?? '')
        : 'Name not available',
      type: MessageType.TRANSFER,
      message: `${currentMember?.name.firstName} ${currentMember?.name.lastName} ${MessageEventType.TRANSFER} ${to} (${today.toISOString().split('T')[0].replaceAll('-', '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`,
    });
  };

  const holdService = () => {
    const today = new Date();

    // const platformSpecificMessage = isWhatsappDocument(selectedChat)
    //   ? sendEventMessage
    //   : messengerEventMessage;
    const platformSpecificMessage = sendWhatsappEventMessage;

    platformSpecificMessage({
      agent: {
        id: currentMember?.agentId,
        name: `${currentMember?.name.firstName} ${currentMember?.name.lastName}`,
      },
      eventStatus: MessageType.ONHOLD,
      status: statusEnum.OnHold,
      from:
        `${currentMember?.name.firstName} ${currentMember?.name.lastName}` ||
        'system',
      integrationId: selectedChat?.integrationId || '',
      to: isWhatsappDocument(selectedChat)
        ? (selectedChat?.client.phone ?? '')
        : 'Name not available',
      type: MessageType.ONHOLD,
      message: `${currentMember?.name.firstName} ${currentMember?.name.lastName} ${MessageEventType.ONHOLD} (${today.toISOString().split('T')[0].replaceAll('-', '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`,
    });
  };

  const handleSearch = (
    searchTerm: string,
  ): { users: FilteredUser[]; messages: FilteredMessage[] } => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const filteredChats = whatsappChats.flatMap((chat) => {
      const chatId = chat.integrationId + `_${chat.client.phone}`;

      const matchingMessages = chat.messages.filter((message) =>
        message.message.toLowerCase().includes(lowercasedSearchTerm),
      );

      return matchingMessages.map((message) => ({
        chatId,
        message: message.message,
        chat,
      }));
    });

    const filteredMembers = workspaceMembers.flatMap((member) => {
      const memberName =
        `${member.name.firstName} ${member.name.lastName}`.toLowerCase();

      if (
        memberName.includes(lowercasedSearchTerm) &&
        member.id !== currentWorkspaceMember?.id
      ) {
        return whatsappChats
          .filter((chat) => chat.agent === member.agentId)
          .map((chat) => ({
            chatId: chat.integrationId + `_${chat.client.phone}`,
            agent: member,
          }));
      }

      return [];
    });

    return {
      users: filteredMembers,
      messages: filteredChats,
    };
  };

  return (
    <ChatContext.Provider
      value={{
        selectedChatId,
        setSelectedChatId,
        sortChats,
        selectedChat,
        TAB_LIST_COMPONENT_ID,
        activeTabId,
        whatsappChats,
        whatsappIntegrations,
        activeWhatsappIntegrations,
        startService,
        finalizeService,
        transferService,
        holdService,
        workspaceAgents,
        unreadTabMessages,
        currentMember,
        isStartChatOpen,
        setIsStartChatOpen,
        // messengerChats,
        // messengerIntegrations,
        startChatNumber,
        setStartChatNumber,
        startChatIntegrationId,
        setStartChatIntegrationId,
        handleSearch,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const CallCenterContext = ChatContext;
