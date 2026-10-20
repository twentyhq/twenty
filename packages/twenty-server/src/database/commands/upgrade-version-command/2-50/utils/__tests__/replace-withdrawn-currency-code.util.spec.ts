import {
  replaceWithdrawnCurrencyCodeInChartConfiguration,
  replaceWithdrawnCurrencyCodeInDefaultValue,
  replaceWithdrawnCurrencyCodeInFilterValue,
  replaceWithdrawnCurrencyCodeInFindRecordsSteps,
} from 'src/database/commands/upgrade-version-command/2-50/utils/replace-withdrawn-currency-code.util';

describe('replaceWithdrawnCurrencyCodeInFilterValue', () => {
  it.each([
    ['["ANG"]', '["XCG"]'],
    ['["USD","ANG"]', '["USD","XCG"]'],
    ['["ANG","XCG"]', '["XCG"]'],
  ])('replaces %s with %s', (value, expected) => {
    expect(replaceWithdrawnCurrencyCodeInFilterValue(value)).toEqual({
      value: expected,
      hasChanged: true,
    });
  });

  it.each([['["USD"]'], ['[]'], ['ANG'], ['not json'], [null], [['ANG']]])(
    'leaves %p unchanged',
    (value) => {
      expect(replaceWithdrawnCurrencyCodeInFilterValue(value)).toEqual({
        value,
        hasChanged: false,
      });
    },
  );
});

describe('replaceWithdrawnCurrencyCodeInDefaultValue', () => {
  it('replaces a quoted withdrawn currency code', () => {
    expect(
      replaceWithdrawnCurrencyCodeInDefaultValue({
        amountMicros: null,
        currencyCode: "'ANG'",
      }),
    ).toEqual({
      value: { amountMicros: null, currencyCode: "'XCG'" },
      hasChanged: true,
    });
  });

  it.each([
    [null],
    [{ amountMicros: null, currencyCode: "'USD'" }],
    [{ amountMicros: null, currencyCode: null }],
    ["'ANG'"],
  ])('leaves %p unchanged', (defaultValue) => {
    expect(replaceWithdrawnCurrencyCodeInDefaultValue(defaultValue)).toEqual({
      value: defaultValue,
      hasChanged: false,
    });
  });
});

const CURRENCY_FIELD_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_FIELD_ID = '22222222-2222-4222-8222-222222222222';

const currencyFieldMetadataIds = new Set([CURRENCY_FIELD_ID]);

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

describe('replaceWithdrawnCurrencyCodeInChartConfiguration', () => {
  it('replaces the currency code in currency code record filters', () => {
    expect(
      replaceWithdrawnCurrencyCodeInChartConfiguration({
        configuration: {
          configurationType: 'BAR_CHART',
          filter: buildFilter([currencyCodeRecordFilter]),
        },
        currencyFieldMetadataIds,
      }),
    ).toEqual({
      value: {
        configurationType: 'BAR_CHART',
        filter: buildFilter([
          { ...currencyCodeRecordFilter, value: '["XCG","USD"]' },
        ]),
      },
      hasChanged: true,
    });
  });

  it.each([
    [{ ...currencyCodeRecordFilter, fieldMetadataId: OTHER_FIELD_ID }],
    [{ ...currencyCodeRecordFilter, subFieldName: 'amountMicros' }],
  ])('leaves other record filters unchanged', (recordFilter) => {
    const configuration = { filter: buildFilter([recordFilter]) };

    expect(
      replaceWithdrawnCurrencyCodeInChartConfiguration({
        configuration,
        currencyFieldMetadataIds,
      }),
    ).toEqual({ value: configuration, hasChanged: false });
  });
});

describe('replaceWithdrawnCurrencyCodeInFindRecordsSteps', () => {
  it('replaces the currency code in Find Records steps only', () => {
    const codeStep = { type: 'CODE', settings: { input: {} } };

    expect(
      replaceWithdrawnCurrencyCodeInFindRecordsSteps({
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
      replaceWithdrawnCurrencyCodeInFindRecordsSteps({
        steps,
        currencyFieldMetadataIds,
      }),
    ).toEqual({ value: steps, hasChanged: false });
  });
});
