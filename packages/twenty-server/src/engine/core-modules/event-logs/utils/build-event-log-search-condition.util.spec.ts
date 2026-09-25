import { EventLogTable } from 'twenty-shared/types';

import { EventLogsExceptionCode } from 'src/engine/core-modules/event-logs/event-logs.exception';
import { buildEventLogSearchCondition } from 'src/engine/core-modules/event-logs/utils/build-event-log-search-condition.util';

describe('buildEventLogSearchCondition', () => {
  it.each([
    {
      table: EventLogTable.APPLICATION_LOG,
      expected:
        '(toString("logicFunctionName") ILIKE {searchPattern:String} OR toString("message") ILIKE {searchPattern:String})',
    },
    {
      table: EventLogTable.PAGEVIEW,
      expected:
        '(toString("properties"."pathname") ILIKE {searchPattern:String})',
    },
  ])('matches the searchable fields of $table', ({ table, expected }) => {
    expect(
      buildEventLogSearchCondition({ parameterName: 'searchPattern', table }),
    ).toBe(expected);
  });

  it('rejects a table without searchable fields', () => {
    expect(() =>
      buildEventLogSearchCondition({
        parameterName: 'searchPattern',
        table: EventLogTable.USAGE_EVENT,
      }),
    ).toThrow(
      expect.objectContaining({ code: EventLogsExceptionCode.INVALID_SEARCH }),
    );
  });
});
