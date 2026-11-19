import { getConditionalAvailabilityRecordFieldSubFieldLabel } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubFieldLabel';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getConditionalAvailabilityRecordFieldSubFieldLabel', () => {
  it('labels a known sub-field', () => {
    expect(
      getConditionalAvailabilityRecordFieldSubFieldLabel({
        field: { type: FieldMetadataType.ADDRESS },
        subFieldName: 'addressCity',
      }),
    ).toBe('City');
  });

  it('gives no label for a plain field or an unknown sub-field', () => {
    expect(
      getConditionalAvailabilityRecordFieldSubFieldLabel({
        field: { type: FieldMetadataType.TEXT },
        subFieldName: 'amountMicros',
      }),
    ).toBeNull();
    expect(
      getConditionalAvailabilityRecordFieldSubFieldLabel({
        field: { type: FieldMetadataType.CURRENCY },
        subFieldName: 'unknownSubField',
      }),
    ).toBeNull();
  });
});
