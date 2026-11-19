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
