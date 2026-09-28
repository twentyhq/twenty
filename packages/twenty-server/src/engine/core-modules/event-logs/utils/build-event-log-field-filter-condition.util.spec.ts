import { EventLogTable } from 'twenty-shared/types';

import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';
import { EventLogsExceptionCode } from 'src/engine/core-modules/event-logs/event-logs.exception';
import { buildEventLogFieldFilterCondition } from 'src/engine/core-modules/event-logs/utils/build-event-log-field-filter-condition.util';

describe('buildEventLogFieldFilterCondition', () => {
  it('matches any of the values with IS', () => {
    expect(
      buildEventLogFieldFilterCondition({
        fieldFilter: {
          field: 'level',
          operand: EventLogFilterOperand.IS,
          values: ['ERROR', 'WARN'],
        },
        parameterName: 'fieldFilter0',
        table: EventLogTable.APPLICATION_LOG,
      }),
    ).toBe('"level" IN {fieldFilter0:Array(String)}');
  });

  it('excludes the values with IS_NOT', () => {
    expect(
      buildEventLogFieldFilterCondition({
        fieldFilter: {
          field: 'event',
          operand: EventLogFilterOperand.IS_NOT,
          values: ['Object Record Updated'],
        },
        parameterName: 'fieldFilter1',
        table: EventLogTable.OBJECT_EVENT,
      }),
    ).toBe('"event" NOT IN {fieldFilter1:Array(String)}');
  });

  it.each([
    {
      reason: 'a field the table does not expose',
      field: 'level',
      values: ['ERROR'],
    },
    {
      reason: 'a field that is not a column',
      field: 'userId" OR 1 = 1 --',
      values: ['user-1'],
    },
    { reason: 'an empty values list', field: 'event', values: [] },
    {
      reason: 'more than 100 values',
      field: 'recordId',
      values: Array.from({ length: 101 }, (_, index) => `record-${index}`),
    },
  ])('rejects $reason', ({ field, values }) => {
    expect(() =>
      buildEventLogFieldFilterCondition({
        fieldFilter: { field, operand: EventLogFilterOperand.IS, values },
        parameterName: 'fieldFilter0',
        table: EventLogTable.OBJECT_EVENT,
      }),
    ).toThrow(
      expect.objectContaining({
        code: EventLogsExceptionCode.INVALID_FIELD_FILTER,
      }),
    );
  });
});
