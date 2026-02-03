import { registerEnumType } from '@nestjs/graphql';

export enum EventLogTable {
  WORKSPACE_EVENT = 'WORKSPACE_EVENT',
  PAGEVIEW = 'PAGEVIEW',
  OBJECT_EVENT = 'OBJECT_EVENT',
}

registerEnumType(EventLogTable, {
  name: 'EventLogTable',
});
