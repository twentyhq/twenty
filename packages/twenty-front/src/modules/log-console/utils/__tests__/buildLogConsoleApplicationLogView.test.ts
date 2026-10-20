import { buildLogConsoleApplicationLogView } from '@/log-console/utils/buildLogConsoleApplicationLogView';
import { EventLogFilterOperand } from '~/generated-metadata/graphql';

describe('buildLogConsoleApplicationLogView', () => {
  it('should open app logs filtered on the application', () => {
    expect(
      buildLogConsoleApplicationLogView({ applicationId: 'application-1' }),
    ).toEqual({
      sourceId: 'app-logs',
      filters: [
        {
          filterFieldId: 'app',
          operand: EventLogFilterOperand.IS,
          values: ['application-1'],
        },
      ],
    });
  });

  it('should open app logs filtered on the logic function', () => {
    expect(
      buildLogConsoleApplicationLogView({ logicFunctionId: 'function-1' })
        .filters,
    ).toEqual([
      {
        filterFieldId: 'function',
        operand: EventLogFilterOperand.IS,
        values: ['function-1'],
      },
    ]);
  });
});
