import { type AvatarShape } from 'twenty-ui/data-display';
export type ObjectRecordIdentifier = {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarShape?: AvatarShape | null;
  linkToShowPage?: string;
};
