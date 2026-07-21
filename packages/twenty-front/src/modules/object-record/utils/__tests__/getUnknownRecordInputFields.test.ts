import { getUnknownRecordInputFields } from '@/object-record/utils/getUnknownRecordInputFields';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('getUnknownRecordInputFields', () => {
  const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

  it('should return an empty array when every field is known', () => {
    const result = getUnknownRecordInputFields({
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        city: 'Paris',
      },
    });

    expect(result).toEqual([]);
  });

  it('should ignore the __typename key', () => {
    const result = getUnknownRecordInputFields({
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        __typename: 'Person',
        city: 'Paris',
      },
    });

    expect(result).toEqual([]);
  });

  it('should return fields absent from the object metadata', () => {
    const result = getUnknownRecordInputFields({
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        city: 'Paris',
        someFieldCreatedInAnotherTab: 'value',
      },
    });

    expect(result).toEqual(['someFieldCreatedInAnotherTab']);
  });

  it('should accept relation join column names', () => {
    const result = getUnknownRecordInputFields({
      objectMetadataItem: personObjectMetadataItem,
      recordInput: {
        companyId: '20202020-0713-40a5-8216-82802401d33e',
      },
    });

    expect(result).toEqual([]);
  });
});
