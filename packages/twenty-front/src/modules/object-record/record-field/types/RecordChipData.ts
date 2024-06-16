import { AvatarType } from 'twenty-ui';

export type RecordChipData = {
  recordId: string;
  name: string | number;
  avatarType: AvatarType;
  avatarUrl: string;
  linkToShowPage: string;
};
