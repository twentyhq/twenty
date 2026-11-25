import { buildStoredFormulaRecordUpdate } from 'src/engine/core-modules/stored-formula-field/utils/build-stored-formula-record-update.util';

describe('buildStoredFormulaRecordUpdate', () => {
  it('should write scalar fields by name and composite fields as one object', () => {
    expect(
      buildStoredFormulaRecordUpdate({
        columnExpressions: [
          { fieldName: 'gadgetCount' },
          { fieldName: 'stockValue', compositePropertyName: 'amountMicros' },
          { fieldName: 'stockValue', compositePropertyName: 'currencyCode' },
        ],
        values: [3, 12000000, 'EUR'],
      }),
    ).toEqual({
      gadgetCount: 3,
      stockValue: { amountMicros: 12000000, currencyCode: 'EUR' },
    });
  });

  it('should write an empty value as null', () => {
    expect(
      buildStoredFormulaRecordUpdate({
        columnExpressions: [{ fieldName: 'lastReleasedAt' }],
        values: [undefined],
      }),
    ).toEqual({ lastReleasedAt: null });
  });
});
