import { registerEnumType } from '@nestjs/graphql';

export enum InteractiveConnectionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  CONNECTED = 'CONNECTED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(InteractiveConnectionStatus, {
  name: 'InteractiveConnectionStatus',
});
