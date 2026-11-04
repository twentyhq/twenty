import { replaceWithdrawnCurrencyCodeInWorkflowTriggers } from 'src/database/commands/upgrade-version-command/2-55/utils/replace-withdrawn-currency-code-in-workflow-triggers.util';

const CURRENCY_FIELD_ID = '11111111-1111-4111-8111-111111111111';

const currencyFieldMetadataIds = new Set([CURRENCY_FIELD_ID]);

const buildDatabaseEventTrigger = (value: string) => ({
  type: 'DATABASE_EVENT',
  settings: {
    eventName: 'opportunity.updated',
    outputSchema: {},
    filter: {
      stepFilterGroups: [],
      stepFilters: [
        {
          id: 'step-filter-id',
          type: 'CURRENCY',
          stepOutputKey: '{{trigger.properties.after.amount}}',
          operand: 'IS',
          value,
          stepFilterGroupId: 'step-filter-group-id',
          fieldMetadataId: CURRENCY_FIELD_ID,
          compositeFieldSubFieldName: 'currencyCode',
        },
      ],
    },
  },
});

const cronTrigger = { type: 'CRON', settings: { pattern: '0 * * * *' } };

describe('replaceWithdrawnCurrencyCodeInWorkflowTriggers', () => {
  it('replaces the currency code in each database event trigger', () => {
    expect(
      replaceWithdrawnCurrencyCodeInWorkflowTriggers({
        triggers: [cronTrigger, buildDatabaseEventTrigger('["ANG"]')],
        currencyFieldMetadataIds,
      }),
    ).toEqual({
      value: [cronTrigger, buildDatabaseEventTrigger('["XCG"]')],
      hasChanged: true,
    });
  });

  it.each([
    [[cronTrigger, buildDatabaseEventTrigger('["USD"]')]],
    [[]],
    [null],
    [buildDatabaseEventTrigger('["ANG"]')],
  ])('leaves %p unchanged', (triggers) => {
    expect(
      replaceWithdrawnCurrencyCodeInWorkflowTriggers({
        triggers,
        currencyFieldMetadataIds,
      }),
    ).toEqual({ value: triggers, hasChanged: false });
  });
});
