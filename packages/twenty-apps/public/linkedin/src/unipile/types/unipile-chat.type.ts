import { type UnipileChatParticipant } from 'src/unipile/types/unipile-chat-participant.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type UnipileChat = {
  id: string;
  name: string;
  is_group: boolean;
  is_1to1: boolean;
  user_id?: string;
  user?: UnipileUser;
  participants?: UnipileChatParticipant[];
};
