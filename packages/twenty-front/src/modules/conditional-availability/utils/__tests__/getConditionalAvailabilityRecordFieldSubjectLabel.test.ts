import { getConditionalAvailabilityRecordFieldSubFieldLabel } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubFieldLabel';
import { getConditionalAvailabilityRecordFieldSubjectLabel } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubjectLabel';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getConditionalAvailabilityRecordFieldSubjectLabel', () => {
  it('joins the field and sub-field labels for a composite', () => {
    expect(
      getConditionalAvailabilityRecordFieldSubjectLabel({
        field: { type: FieldMetadataType.CURRENCY, label: 'Annual Revenue' },
        subFieldName: 'amountMicros',
      }),
    ).toBe('Annual Revenue · Amount');
  });

  it('shows the field label alone for a plain field', () => {
    expect(
      getConditionalAvailabilityRecordFieldSubjectLabel({
        field: { type: FieldMetadataType.TEXT, label: 'Name' },
        subFieldName: null,
      }),
    ).toBe('Name');
  });
});

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
