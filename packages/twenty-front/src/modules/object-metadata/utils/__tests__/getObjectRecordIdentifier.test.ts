import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

describe('getObjectRecordIdentifier', () => {
  it('should expose the label identifier value as the name', () => {
    const identifier = getObjectRecordIdentifier({
      objectMetadataItem: companyObjectMetadataItem,
      record: { __typename: 'Company', id: 'company-id', name: 'Acme' },
      allowRequestsToTwentyIcons: false,
    });

    expect(identifier.name).toBe('Acme');
  });

  it('should name a restricted record as not shared', () => {
    const identifier = getObjectRecordIdentifier({
      objectMetadataItem: companyObjectMetadataItem,
      record: {
        __typename: 'Company',
        id: 'company-id',
        name: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
      allowRequestsToTwentyIcons: false,
    });

    expect(identifier.name).toBe('Not shared');
  });
});
