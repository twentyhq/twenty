import { WhatsappDocument } from '@/chat/types/WhatsappDocument';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export interface FilteredUser {
  chatId: string;
  agent: WorkspaceMember;
}

export interface FilteredMessage {
  chatId: string;
  message: string;
  chat: WhatsappDocument;
}
