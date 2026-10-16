import { EventLogFilterOperand } from 'src/engine/core-modules/event-logs/dtos/event-log-filter-operand.enum';
import { isEventLogRowMatchingFieldFilters } from 'src/engine/core-modules/event-logs/utils/is-event-log-row-matching-field-filters.util';

const ROW_WITHOUT_USER_ID = {
  event: 'AuthSession',
  workspaceId: 'workspace-1',
};

describe('isEventLogRowMatchingFieldFilters', () => {
  it.each([
    { reason: 'no filter', fieldFilters: [], expected: true },
    {
      reason: 'IS listing the row value',
      fieldFilters: [
        {
          field: 'event',
          operand: EventLogFilterOperand.IS,
          values: ['User Signup', 'AuthSession'],
        },
      ],
      expected: true,
    },
    {
      reason: 'IS not listing the row value',
      fieldFilters: [
        {
          field: 'event',
          operand: EventLogFilterOperand.IS,
          values: ['Webhook Response'],
        },
      ],
      expected: false,
    },
    {
      reason: 'IS_NOT listing the row value',
      fieldFilters: [
        {
          field: 'event',
          operand: EventLogFilterOperand.IS_NOT,
          values: ['AuthSession'],
        },
      ],
      expected: false,
    },
    {
      reason: 'a missing column, read as an empty string',
      fieldFilters: [
        { field: 'userId', operand: EventLogFilterOperand.IS, values: [''] },
      ],
      expected: true,
    },
    {
      reason: 'one filter out of two matching',
      fieldFilters: [
        {
          field: 'event',
          operand: EventLogFilterOperand.IS,
          values: ['AuthSession'],
        },
        {
          field: 'userId',
          operand: EventLogFilterOperand.IS,
          values: ['user-1'],
        },
      ],
      expected: false,
    },
  ])('returns $expected for $reason', ({ fieldFilters, expected }) => {
    expect(
      isEventLogRowMatchingFieldFilters({
        row: ROW_WITHOUT_USER_ID,
        fieldFilters,
      }),
    ).toBe(expected);
  });
});

it('matches a platform event with the same filter used for historical queries', () => {
  expect(
    isEventLogRowMatchingFieldFilters({
      row: {
        logicFunctionId: '',
        logicFunctionName: 'application.api.rate_limited',
      },
      fieldFilters: [
        {
          field: 'functionOrEvent',
          operand: EventLogFilterOperand.IS,
          values: ['event:application.api.rate_limited'],
        },
      ],
    }),
  ).toBe(true);
  expect(
    isEventLogRowMatchingFieldFilters({
      row: { logicFunctionId: 'function-id', logicFunctionName: 'sync' },
      fieldFilters: [
        {
          field: 'functionOrEvent',
          operand: EventLogFilterOperand.IS,
          values: ['function-id'],
        },
      ],
    }),
  ).toBe(true);
});
