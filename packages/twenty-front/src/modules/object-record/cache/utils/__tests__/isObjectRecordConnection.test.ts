import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
describe('isObjectRecordConnection', () => {
  const relationDefinitionMap: { [K in RelationDefinitionType]: boolean } = {
    [RelationDefinitionType.MANY_TO_MANY]: true,
    [RelationDefinitionType.ONE_TO_MANY]: true,
    [RelationDefinitionType.MANY_TO_ONE]: false,
    [RelationDefinitionType.ONE_TO_ONE]: false,
  };

  it.each(Object.entries(relationDefinitionMap))(
    '.$relation',
    (relation, expected) => {
      const emtpyRecord = {};
      const result = isObjectRecordConnection(
        {
          direction: relation,
        } as NonNullable<FieldMetadataItem['relationDefinition']>,
        emtpyRecord,
      );

      expect(result).toEqual(expected);
    },
  );

  it('should throw on unknown relation direction', () => {
    const emtpyRecord = {};
    expect(() =>
      isObjectRecordConnection(
        {
          direction: '20202020-bdb9-4ac4-ad5d-932960fe879b',
        } as any,
        emtpyRecord,
      ),
    ).toThrowError();
  });
});
