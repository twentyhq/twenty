import {
  FilteredMessage,
  FilteredUser,
} from '@/chat/call-center/types/SearchType';
import { UnreadMessages } from '@/chat/types/MessageType';
import { WhatsappDocument } from '@/chat/types/WhatsappDocument';
import { FindWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/FindWhatsappIntegrationInput';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { Dispatch, SetStateAction } from 'react';

export type CallCenterContextType = {
  selectedChatId: string | null;
  setSelectedChatId: Dispatch<SetStateAction<string | null>>;
  sortChats: () => void;
  selectedChat: WhatsappDocument | undefined; // | FacebookDocument
  TAB_LIST_COMPONENT_ID: string;
  activeTabId: string | null;
  whatsappChats: WhatsappDocument[];
  whatsappIntegrations: FindWhatsappIntegration[];
  activeWhatsappIntegrations: FindWhatsappIntegration[];
  startService: () => void;
  finalizeService: () => void;
  transferService: (agent?: WorkspaceMember, sector?: Sector) => void;
  holdService: () => void;
  workspaceAgents: WorkspaceMember[];
  unreadTabMessages: UnreadMessages | null;
  currentMember: WorkspaceMember | undefined;
  isStartChatOpen: boolean;
  setIsStartChatOpen: Dispatch<SetStateAction<boolean>>;
  // messengerChats: FacebookDocument[];
  // messengerIntegrations: MessengerIntegration[];
  startChatNumber: string | null;
  setStartChatNumber: Dispatch<SetStateAction<string | null>>;
  startChatIntegrationId: string | null;
  setStartChatIntegrationId: Dispatch<SetStateAction<string | null>>;
  handleSearch: (searchTerm: string) => {
    users: FilteredUser[];
    messages: FilteredMessage[];
  };
};
