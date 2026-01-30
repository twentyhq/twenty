import { registerEnumType } from '@nestjs/graphql';

export enum EventLogTable {
  WORKSPACE_EVENT = 'workspaceEvent',
  PAGEVIEW = 'pageview',
  OBJECT_EVENT = 'objectEvent',
}

registerEnumType(EventLogTable, {
  name: 'EventLogTable',
  description: 'Available event log tables in ClickHouse',
});
