import { replaceWithdrawnCurrencyCodeInChartConfiguration } from 'src/database/commands/upgrade-version-command/2-56/utils/replace-withdrawn-currency-code-in-chart-configuration.util';

const CURRENCY_FIELD_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_FIELD_ID = '22222222-2222-4222-8222-222222222222';
const RELATION_FIELD_ID = '33333333-3333-4333-8333-333333333333';

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

  it('replaces the currency code in filters on a related record currency field', () => {
    const relatedCurrencyCodeRecordFilter = {
      ...currencyCodeRecordFilter,
      fieldMetadataId: RELATION_FIELD_ID,
      relationTargetFieldMetadataId: CURRENCY_FIELD_ID,
    };

    expect(
      replaceWithdrawnCurrencyCodeInChartConfiguration({
        configuration: {
          filter: buildFilter([relatedCurrencyCodeRecordFilter]),
        },
        currencyFieldMetadataIds,
      }),
    ).toEqual({
      value: {
        filter: buildFilter([
          { ...relatedCurrencyCodeRecordFilter, value: '["XCG","USD"]' },
        ]),
      },
      hasChanged: true,
    });
  });

  it.each([
    [{ ...currencyCodeRecordFilter, fieldMetadataId: OTHER_FIELD_ID }],
    [{ ...currencyCodeRecordFilter, subFieldName: 'amountMicros' }],
    [
      {
        ...currencyCodeRecordFilter,
        fieldMetadataId: RELATION_FIELD_ID,
        relationTargetFieldMetadataId: OTHER_FIELD_ID,
      },
    ],
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
