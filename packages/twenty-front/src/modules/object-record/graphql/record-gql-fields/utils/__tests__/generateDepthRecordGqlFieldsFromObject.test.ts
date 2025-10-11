import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('generateDepthRecordGqlFieldsFromObject', () => {
  it('should generate depth one record gql fields from object', () => {
    const result = generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 1,
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate depth zero record gql fields from object', () => {
    const result = generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 0,
    });

    expect(result).toMatchSnapshot();
  });
});
