import { AvatarType } from '@/users/components/Avatar';

type RecordMappedToIdentifiers = {
  id: string;
  name: string;
  avatarUrl?: string;
  linkToEntity?: string;
  avatarType: AvatarType;
  record: any;
};

export type IdentifiersMapper = (
  record: any,
  relationPickerType: string,
) => RecordMappedToIdentifiers | undefined;
