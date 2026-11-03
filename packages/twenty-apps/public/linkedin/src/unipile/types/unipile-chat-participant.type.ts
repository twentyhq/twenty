import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type UnipileChatParticipant = {
  is_self: boolean;
  user: UnipileUser;
};
