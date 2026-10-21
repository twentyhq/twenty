import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'name',
});

describe('getLabelIdentifierFieldValue', () => {
  it('should return the label identifier value', () => {
    expect(
      getLabelIdentifierFieldValue(
        { __typename: 'Company', id: 'company-id', name: 'Acme' },
        nameField,
      ),
    ).toBe('Acme');
  });

  it('should say a restricted name is not shared rather than print the sentinel', () => {
    expect(
      getLabelIdentifierFieldValue(
        {
          __typename: 'Company',
          id: 'company-id',
          name: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        },
        nameField,
      ),
    ).toBe('Not shared');
  });

  it('should fall back to the record id without a label identifier field', () => {
    expect(
      getLabelIdentifierFieldValue(
        { __typename: 'Company', id: 'company-id' },
        undefined,
      ),
    ).toBe('company-id');
  });
});
