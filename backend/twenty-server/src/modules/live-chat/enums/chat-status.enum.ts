import { registerEnumType } from '@nestjs/graphql';

export enum ChatStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

registerEnumType(ChatStatus, {
  name: 'ChatStatus',
  description: 'Chat status',
});
