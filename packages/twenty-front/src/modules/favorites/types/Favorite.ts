import { AvatarType } from 'twenty-ui';

export type Favorite = {
  id: string;
  position: number;
  [key: string]: any;
  labelIdentifier: string;
  avatarUrl: string;
  avatarType: AvatarType;
  link: string;
  recordId: string;
  workspaceMemberId: string;
  favoriteFolderId?: string;
  __typename: 'Favorite';
};
