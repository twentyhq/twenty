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
      const emptyRecord = {};
      const result = isObjectRecordConnection(
        {
          direction: relation,
        } as NonNullable<FieldMetadataItem['relationDefinition']>,
        emptyRecord,
      );

      expect(result).toEqual(expected);
    },
  );

  it('should throw on unknown relation direction', () => {
    const emptyRecord = {};
    expect(() =>
      isObjectRecordConnection(
        {
          direction: 'UNKNOWN_TYPE',
        } as any,
        emptyRecord,
      ),
    ).toThrowError();
  });
});
