import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

export const USER_FACING_FIELD_METADATA_EXCEPTION_CODES: FieldMetadataExceptionCode[] =
  [
    FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
  ];
