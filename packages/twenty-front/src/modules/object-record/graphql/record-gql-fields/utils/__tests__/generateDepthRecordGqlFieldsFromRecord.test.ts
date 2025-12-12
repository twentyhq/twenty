import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('generateDepthRecordGqlFieldsFromRecord', () => {
  it('should generate depth one record gql fields from record with some fields', () => {
    const result = generateDepthRecordGqlFieldsFromRecord({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 1,
      record: {
        id: '123',
        name: 'Test Company',
        domainName: 'test.com',
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate depth zero record gql fields from record with some fields', () => {
    const result = generateDepthRecordGqlFieldsFromRecord({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 0,
      record: {
        id: '123',
        name: 'Test Company',
      },
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate depth one record gql fields from empty record', () => {
    const result = generateDepthRecordGqlFieldsFromRecord({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 1,
      record: {},
    });

    expect(result).toMatchSnapshot();
  });
});
