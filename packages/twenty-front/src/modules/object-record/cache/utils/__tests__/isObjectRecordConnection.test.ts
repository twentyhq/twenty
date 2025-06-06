import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';
import { RelationType } from '~/generated-metadata/graphql';
describe('isObjectRecordConnection', () => {
  const relationDefinitionMap: { [K in RelationType]: boolean } = {
    [RelationType.ONE_TO_MANY]: true,
    [RelationType.MANY_TO_ONE]: false,
  };

  it.each(Object.entries(relationDefinitionMap))(
    '.$relation',
    (relation, expected) => {
      const emptyRecord = {};
      const result = isObjectRecordConnection(
        {
          type: relation,
        } as NonNullable<FieldMetadataItem['relation']>,
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
