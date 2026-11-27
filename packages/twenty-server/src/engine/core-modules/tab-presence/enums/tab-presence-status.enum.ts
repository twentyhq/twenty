import { registerEnumType } from '@nestjs/graphql';

export enum TabPresenceStatus {
  FOCUSED = 'FOCUSED',
  OPEN = 'OPEN',
}

registerEnumType(TabPresenceStatus, { name: 'TabPresenceStatus' });
