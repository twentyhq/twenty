import { getRecordFormFieldInputSettings } from '@/object-record/record-form/utils/getRecordFormFieldInputSettings';
import { FieldMetadataType } from 'twenty-shared/types';

describe('getRecordFormFieldInputSettings', () => {
  it('should take currency amounts in units', () => {
    expect(getRecordFormFieldInputSettings(FieldMetadataType.CURRENCY)).toEqual(
      { type: FieldMetadataType.CURRENCY, amountUnit: 'units' },
    );
  });

  it.each([FieldMetadataType.NUMBER, FieldMetadataType.TEXT])(
    'should have no settings for %s fields',
    (fieldType) => {
      expect(getRecordFormFieldInputSettings(fieldType)).toBeUndefined();
    },
  );
});
