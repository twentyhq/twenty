import { type AvatarShape } from 'twenty-ui/primitives/data-display';
export type ObjectRecordIdentifier = {
  id: string;
  name: string;
  isNameRestricted?: boolean;
  avatarUrl?: string;
  avatarShape?: AvatarShape | null;
  linkToShowPage?: string;
};
