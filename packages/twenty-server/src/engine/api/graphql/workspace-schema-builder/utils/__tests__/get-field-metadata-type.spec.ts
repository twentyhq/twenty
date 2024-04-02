import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { getFieldMetadataType } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-field-metadata-type.util';

describe('getFieldMetadataType', () => {
  it.each([
    ['uuid', FieldMetadataType.UUID],
    ['timestamptz', FieldMetadataType.DATE_TIME],
  ])(
    'should return correct FieldMetadataType for type %s',
    (type, expectedMetadataType) => {
      expect(getFieldMetadataType(type)).toBe(expectedMetadataType);
    },
  );

  it('should throw an error for an unknown type', () => {
    const unknownType = 'unknownType';

    expect(() => getFieldMetadataType(unknownType)).toThrow(
      `Unknown type ${unknownType}`,
    );
  });
});
