import { replaceWithdrawnCurrencyCodeInWorkflowTrigger } from 'src/database/commands/upgrade-version-command/2-55/utils/replace-withdrawn-currency-code-in-workflow-trigger.util';

const CURRENCY_FIELD_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_FIELD_ID = '22222222-2222-4222-8222-222222222222';

const currencyFieldMetadataIds = new Set([CURRENCY_FIELD_ID]);

const currencyCodeStepFilter = {
  id: 'step-filter-id',
  type: 'CURRENCY',
  stepOutputKey: '{{trigger.properties.after.amount}}',
  operand: 'IS',
  value: '["ANG","USD"]',
  stepFilterGroupId: 'step-filter-group-id',
  fieldMetadataId: CURRENCY_FIELD_ID,
  compositeFieldSubFieldName: 'currencyCode',
};

const buildTrigger = (stepFilter: Record<string, unknown>) => ({
  type: 'DATABASE_EVENT',
  settings: {
    eventName: 'opportunity.updated',
    outputSchema: {},
    filter: { stepFilterGroups: [], stepFilters: [stepFilter] },
  },
});

describe('replaceWithdrawnCurrencyCodeInWorkflowTrigger', () => {
  it('replaces the currency code in database event trigger filters', () => {
    expect(
      replaceWithdrawnCurrencyCodeInWorkflowTrigger({
        trigger: buildTrigger(currencyCodeStepFilter),
        currencyFieldMetadataIds,
      }),
    ).toEqual({
      value: buildTrigger({
        ...currencyCodeStepFilter,
        value: '["XCG","USD"]',
      }),
      hasChanged: true,
    });
  });

  it.each([
    [
      buildTrigger({
        ...currencyCodeStepFilter,
        fieldMetadataId: OTHER_FIELD_ID,
      }),
    ],
    [
      buildTrigger({
        ...currencyCodeStepFilter,
        compositeFieldSubFieldName: 'amountMicros',
      }),
    ],
    [{ ...buildTrigger(currencyCodeStepFilter), type: 'CRON' }],
    [
      {
        type: 'DATABASE_EVENT',
        settings: { eventName: 'opportunity.created' },
      },
    ],
    [null],
  ])('leaves %p unchanged', (trigger) => {
    expect(
      replaceWithdrawnCurrencyCodeInWorkflowTrigger({
        trigger,
        currencyFieldMetadataIds,
      }),
    ).toEqual({ value: trigger, hasChanged: false });
  });
});
