import { getConditionalAvailabilityRecordFieldRowSubject } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldRowSubject';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const fields = getMockObjectMetadataItemOrThrow('company').readableFields;

describe('getConditionalAvailabilityRecordFieldRowSubject', () => {
  it('finds the field and the sub field a row points at', () => {
    const rowSubject = getConditionalAvailabilityRecordFieldRowSubject({
      fields,
      fieldName: 'address',
      propertyPath: 'address.addressCity',
    });

    expect(rowSubject?.field.name).toBe('address');
    expect(rowSubject?.subject).toMatchObject({
      fieldName: 'address',
      subFieldName: 'addressCity',
      propertyPath: 'address.addressCity',
    });
  });

  it('finds a plain field', () => {
    expect(
      getConditionalAvailabilityRecordFieldRowSubject({
        fields,
        fieldName: 'name',
        propertyPath: 'name',
      })?.subject,
    ).toMatchObject({ fieldName: 'name', subFieldName: null });
  });

  it('finds nothing for a field the object no longer has', () => {
    expect(
      getConditionalAvailabilityRecordFieldRowSubject({
        fields,
        fieldName: 'removedField',
        propertyPath: 'removedField',
      }),
    ).toBeNull();
  });

  it('finds nothing for a sub field the field does not offer', () => {
    expect(
      getConditionalAvailabilityRecordFieldRowSubject({
        fields,
        fieldName: 'address',
        propertyPath: 'address.addressCountry',
      }),
    ).toBeNull();
  });
});
