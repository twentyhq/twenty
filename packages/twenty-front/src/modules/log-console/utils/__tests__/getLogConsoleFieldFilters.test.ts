import { msg } from '@lingui/core/macro';
import { IconTimelineEvent, IconUsers } from 'twenty-ui/icon';

import { getLogConsoleFieldFilters } from '@/log-console/utils/getLogConsoleFieldFilters';
import { EventLogFilterOperand } from '~/generated-metadata/graphql';

const SECURITY_SCOPE = {
  field: 'event',
  operand: EventLogFilterOperand.IS,
  values: ['AuthSession', 'Impersonation'],
};

const SECURITY_SOURCE = {
  fieldFilters: [SECURITY_SCOPE],
  filterFields: [
    {
      id: 'event',
      label: msg`Event`,
      Icon: IconTimelineEvent,
      serverField: 'event',
      getOptions: () => [],
    },
    {
      id: 'actor',
      label: msg`Actor`,
      Icon: IconUsers,
      serverField: 'userId',
      getOptions: () => [],
    },
  ],
};

describe('getLogConsoleFieldFilters', () => {
  it('should send the source scope then each chip on its server field', () => {
    expect(
      getLogConsoleFieldFilters({
        source: SECURITY_SOURCE,
        filters: [
          {
            filterFieldId: 'actor',
            operand: EventLogFilterOperand.IS,
            values: ['user-1', 'user-2'],
          },
          {
            filterFieldId: 'event',
            operand: EventLogFilterOperand.IS_NOT,
            values: ['Impersonation'],
          },
        ],
      }),
    ).toEqual([
      SECURITY_SCOPE,
      {
        field: 'event',
        operand: EventLogFilterOperand.IS_NOT,
        values: ['Impersonation'],
      },
      {
        field: 'userId',
        operand: EventLogFilterOperand.IS,
        values: ['user-1', 'user-2'],
      },
    ]);
  });

  it('should leave out chips without values and chips of other sources', () => {
    expect(
      getLogConsoleFieldFilters({
        source: SECURITY_SOURCE,
        filters: [
          {
            filterFieldId: 'actor',
            operand: EventLogFilterOperand.IS_NOT,
            values: [],
          },
          {
            filterFieldId: 'level',
            operand: EventLogFilterOperand.IS,
            values: ['ERROR'],
          },
        ],
      }),
    ).toEqual([SECURITY_SCOPE]);
  });
});
