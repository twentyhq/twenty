import { replaceWithdrawnCurrencyCodeInWorkflowSteps } from 'src/database/commands/upgrade-version-command/2-53/utils/replace-withdrawn-currency-code-in-workflow-steps.util';

const CURRENCY_FIELD_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_FIELD_ID = '22222222-2222-4222-8222-222222222222';

const currencyFieldMetadataIds = new Set([CURRENCY_FIELD_ID]);
const currencyFieldNamesByObjectNameSingular = new Map([
  ['opportunity', new Set(['amount'])],
]);

const buildFilter = (recordFilters: Record<string, unknown>[]) => ({
  recordFilters,
  recordFilterGroups: [],
});

const currencyCodeRecordFilter = {
  fieldMetadataId: CURRENCY_FIELD_ID,
  subFieldName: 'currencyCode',
  operand: 'IS',
  value: '["ANG","USD"]',
};

describe('replaceWithdrawnCurrencyCodeInWorkflowSteps', () => {
  it('replaces the currency code in Find Records filters', () => {
    const codeStep = { type: 'CODE', settings: { input: {} } };

    expect(
      replaceWithdrawnCurrencyCodeInWorkflowSteps({
        steps: [
          codeStep,
          {
            type: 'FIND_RECORDS',
            settings: {
              input: { filter: buildFilter([currencyCodeRecordFilter]) },
            },
          },
        ],
        currencyFieldMetadataIds,
        currencyFieldNamesByObjectNameSingular,
      }),
    ).toEqual({
      value: [
        codeStep,
        {
          type: 'FIND_RECORDS',
          settings: {
            input: {
              filter: buildFilter([
                { ...currencyCodeRecordFilter, value: '["XCG","USD"]' },
              ]),
            },
          },
        },
      ],
      hasChanged: true,
    });
  });

  it('leaves steps without a withdrawn currency code unchanged', () => {
    const steps = [
      {
        type: 'FIND_RECORDS',
        settings: {
          input: {
            filter: buildFilter([
              { ...currencyCodeRecordFilter, value: '["USD"]' },
            ]),
          },
        },
      },
    ];

    expect(
      replaceWithdrawnCurrencyCodeInWorkflowSteps({
        steps,
        currencyFieldMetadataIds,
        currencyFieldNamesByObjectNameSingular,
      }),
    ).toEqual({ value: steps, hasChanged: false });
  });
});

describe.each(['CREATE_RECORD', 'UPDATE_RECORD', 'UPSERT_RECORD'])(
  'replaceWithdrawnCurrencyCodeInWorkflowSteps for %s steps',
  (type) => {
    const buildStep = (objectRecord: Record<string, unknown>) => ({
      type,
      settings: { input: { objectName: 'opportunity', objectRecord } },
    });

    it('replaces the currency code in the target object currency fields', () => {
      expect(
        replaceWithdrawnCurrencyCodeInWorkflowSteps({
          steps: [
            buildStep({
              name: 'ANG',
              amount: { amountMicros: 1000000, currencyCode: 'ANG' },
            }),
          ],
          currencyFieldMetadataIds,
          currencyFieldNamesByObjectNameSingular,
        }),
      ).toEqual({
        value: [
          buildStep({
            name: 'ANG',
            amount: { amountMicros: 1000000, currencyCode: 'XCG' },
          }),
        ],
        hasChanged: true,
      });
    });

    it.each([
      [{ amount: { amountMicros: 1000000, currencyCode: 'USD' } }],
      [{ amount: { amountMicros: 1000000, currencyCode: '{{trigger.code}}' } }],
      [{ budget: { amountMicros: 1000000, currencyCode: 'ANG' } }],
    ])('leaves %p unchanged', (objectRecord) => {
      const steps = [buildStep(objectRecord)];

      expect(
        replaceWithdrawnCurrencyCodeInWorkflowSteps({
          steps,
          currencyFieldMetadataIds,
          currencyFieldNamesByObjectNameSingular,
        }),
      ).toEqual({ value: steps, hasChanged: false });
    });

    it('leaves steps on objects without currency fields unchanged', () => {
      const steps = [
        {
          type,
          settings: {
            input: {
              objectName: 'company',
              objectRecord: {
                amount: { amountMicros: 1000000, currencyCode: 'ANG' },
              },
            },
          },
        },
      ];

      expect(
        replaceWithdrawnCurrencyCodeInWorkflowSteps({
          steps,
          currencyFieldMetadataIds,
          currencyFieldNamesByObjectNameSingular,
        }),
      ).toEqual({ value: steps, hasChanged: false });
    });
  },
);

describe.each(['FILTER', 'IF_ELSE'])(
  'replaceWithdrawnCurrencyCodeInWorkflowSteps for %s steps',
  (type) => {
    const buildStep = (stepFilter: Record<string, unknown>) => ({
      type,
      settings: { input: { stepFilterGroups: [], stepFilters: [stepFilter] } },
    });

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

    it('replaces the currency code in currency code step filters', () => {
      expect(
        replaceWithdrawnCurrencyCodeInWorkflowSteps({
          steps: [buildStep(currencyCodeStepFilter)],
          currencyFieldMetadataIds,
          currencyFieldNamesByObjectNameSingular,
        }),
      ).toEqual({
        value: [
          buildStep({ ...currencyCodeStepFilter, value: '["XCG","USD"]' }),
        ],
        hasChanged: true,
      });
    });

    it.each([
      [{ ...currencyCodeStepFilter, fieldMetadataId: OTHER_FIELD_ID }],
      [
        {
          ...currencyCodeStepFilter,
          compositeFieldSubFieldName: 'amountMicros',
        },
      ],
      [{ ...currencyCodeStepFilter, fieldMetadataId: undefined }],
    ])('leaves other step filters unchanged', (stepFilter) => {
      const steps = [buildStep(stepFilter)];

      expect(
        replaceWithdrawnCurrencyCodeInWorkflowSteps({
          steps,
          currencyFieldMetadataIds,
          currencyFieldNamesByObjectNameSingular,
        }),
      ).toEqual({ value: steps, hasChanged: false });
    });
  },
);
