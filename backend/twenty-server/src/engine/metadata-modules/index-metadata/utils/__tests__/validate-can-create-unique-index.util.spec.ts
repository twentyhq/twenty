import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateCanCreateUniqueIndex } from 'src/engine/metadata-modules/index-metadata/utils/validate-can-create-unique-index.util';

describe('validateCanCreateUniqueIndex', () => {
  it('should throw an error if field to create is a MORPH type', () => {
    const field = {
      name: 'testField',
      type: FieldMetadataType.MORPH_RELATION,
    };

    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      FieldMetadataException,
    );
    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      'Unique index cannot be created for field testField of type MORPH_RELATION',
    );
  });

  it('should throw an error if field to create is a RELATION type - ONE_TO_MANY', () => {
    const field = {
      name: 'testField',
      type: FieldMetadataType.RELATION,
    };

    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      FieldMetadataException,
    );
    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      'Unique index cannot be created for field testField of type RELATION',
    );
  });

  it('should throw an error if field to create is a FULL_NAME type', () => {
    const field = {
      name: 'testField',
      type: FieldMetadataType.FULL_NAME,
    };

    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      FieldMetadataException,
    );
    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      'Unique index cannot be created for field testField of type FULL_NAME',
    );
  });

  it('should throw an error if field to create is an ADDRESS type', () => {
    const field = {
      name: 'testField',
      type: FieldMetadataType.ADDRESS,
    };

    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      FieldMetadataException,
    );
    expect(() => validateCanCreateUniqueIndex(field)).toThrow(
      'Unique index cannot be created for field testField of type ADDRESS',
    );
  });
});
