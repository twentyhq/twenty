import { EventLogTable } from 'twenty-shared/types';

import {
  EVENT_LOG_TYPES,
  getClickHouseTableName,
} from 'src/engine/core-modules/event-logs/registry/event-log-registry';
import { normalizeEventLogRecords } from 'src/engine/core-modules/event-logs/utils/normalize-event-log-records';

describe('event-log registry', () => {
  it('has a complete definition for every EventLogTable', () => {
    for (const table of Object.values(EventLogTable)) {
      const definition = EVENT_LOG_TYPES[table];

      expect(definition).toBeDefined();
      expect(definition.clickHouseTable).toBeTruthy();
      expect(definition.eventFieldName).toBeTruthy();
    }
  });

  it('exposes the ClickHouse table name', () => {
    expect(getClickHouseTableName(EventLogTable.WORKSPACE_EVENT)).toBe(
      'workspaceEvent',
    );
    expect(getClickHouseTableName(EventLogTable.APPLICATION_LOG)).toBe(
      'applicationLog',
    );
  });

  it('gates every table except application logs behind an entitlement', () => {
    expect(
      EVENT_LOG_TYPES[EventLogTable.APPLICATION_LOG].requiresEntitlement,
    ).toBeNull();
    expect(
      EVENT_LOG_TYPES[EventLogTable.WORKSPACE_EVENT].requiresEntitlement,
    ).not.toBeNull();
    expect(
      EVENT_LOG_TYPES[EventLogTable.USAGE_EVENT].requiresEntitlement,
    ).not.toBeNull();
  });

  describe('normalize', () => {
    const timestamp = '2026-01-01 00:00:00.000';

    it('maps a workspace event row', () => {
      const record = EVENT_LOG_TYPES[EventLogTable.WORKSPACE_EVENT].normalize({
        event: 'user.signup',
        timestamp,
        userId: 'user-1',
        properties: { a: 1 },
      });

      expect(record.event).toBe('user.signup');
      expect(record.userId).toBe('user-1');
      expect(record.properties).toEqual({ a: 1 });
    });

    it('parses the ClickHouse timestamp as UTC, not server-local time', () => {
      const [record] = normalizeEventLogRecords(
        [{ event: 'user.signup', timestamp }],
        EventLogTable.WORKSPACE_EVENT,
      );

      expect(record.timestamp.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    });

    it('maps a pageview row from the name column', () => {
      const record = EVENT_LOG_TYPES[EventLogTable.PAGEVIEW].normalize({
        name: '/settings',
        timestamp,
      });

      expect(record.event).toBe('/settings');
    });

    it('maps a usage event row (resourceType, userWorkspaceId, folded metadata)', () => {
      const record = EVENT_LOG_TYPES[EventLogTable.USAGE_EVENT].normalize({
        resourceType: 'WORKFLOW_NODE_RUN',
        userWorkspaceId: 'uw-1',
        timestamp,
        quantity: 3,
        metadata: { extra: true },
      });

      expect(record.event).toBe('WORKFLOW_NODE_RUN');
      expect(record.userId).toBe('uw-1');
      expect(record.properties).toMatchObject({ quantity: 3, extra: true });
    });

    it('maps an application log row (logicFunctionName, level, message)', () => {
      const record = EVENT_LOG_TYPES[EventLogTable.APPLICATION_LOG].normalize({
        logicFunctionName: 'myFn',
        timestamp,
        level: 'INFO',
        message: 'hello',
      });

      expect(record.event).toBe('myFn');
      expect(record.properties).toMatchObject({
        level: 'INFO',
        message: 'hello',
      });
    });
  });
});
