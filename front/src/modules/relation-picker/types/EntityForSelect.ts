import { AvatarType } from '@/users/components/Avatar';

import { EntityTypeForSelect } from './EntityTypeForSelect';

export type EntityForSelect = {
  id: string;
  entityType: EntityTypeForSelect;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
};
