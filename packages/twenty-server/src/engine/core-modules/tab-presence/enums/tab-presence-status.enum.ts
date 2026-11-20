import { registerEnumType } from '@nestjs/graphql';

export enum TabPresenceStatus {
  FOCUSED = 'FOCUSED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

registerEnumType(TabPresenceStatus, { name: 'TabPresenceStatus' });
