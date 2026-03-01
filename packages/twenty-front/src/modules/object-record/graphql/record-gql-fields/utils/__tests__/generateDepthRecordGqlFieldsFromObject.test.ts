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

  it('should use readableFields when available to exclude hidden fields', () => {
    const fullItem = getMockObjectMetadataItemOrThrow('company');
    const visibleFields = fullItem.fields.slice(0, 3);

    const resultWithAllFields = generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem: fullItem,
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 0,
    });

    const resultWithReadableFields = generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem: {
        ...fullItem,
        readableFields: visibleFields,
      },
      objectMetadataItems: generatedMockObjectMetadataItems,
      depth: 0,
    });

    const allFieldKeys = Object.keys(resultWithAllFields);
    const readableFieldKeys = Object.keys(resultWithReadableFields);

    expect(readableFieldKeys.length).toBeLessThan(allFieldKeys.length);

    const visibleFieldNames = visibleFields.map((f) => f.name);

    readableFieldKeys.forEach((key) => {
      expect(visibleFieldNames).toContain(key);
    });
  });
});
