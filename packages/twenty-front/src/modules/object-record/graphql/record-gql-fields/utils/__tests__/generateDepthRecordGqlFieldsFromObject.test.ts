import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('generateDepthRecordGqlFieldsFromObject', () => {
  it('should generate depth one record gql fields from object', () => {
    const result = generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      depth: 1,
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate depth zero record gql fields from object', () => {
    const result = generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      depth: 0,
    });

    expect(result).toMatchSnapshot();
  });
});
