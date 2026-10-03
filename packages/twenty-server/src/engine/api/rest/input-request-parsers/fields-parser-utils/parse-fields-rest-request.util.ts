import { isNonEmptyString, isString } from '@sniptt/guards';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const parseFieldsRestRequest = ({
  request,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  restrictedFields,
}: {
  request: Pick<AuthenticatedRequest, 'query'>;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds' | 'nameSingular'>;
  flatFieldMetadataMaps: FlatEntityMaps<
    Pick<
      OrmFlatFieldMetadata,
      'id' | 'universalIdentifier' | 'applicationId' | 'workspaceId' | 'name'
    >
  >;
  restrictedFields: RestrictedFieldsPermissions;
}): string[] | undefined => {
  const rawFields = request.query.fields;

  if (!isDefined(rawFields)) {
    return undefined;
  }

  const rawFieldsValues = Array.isArray(rawFields) ? rawFields : [rawFields];

  if (!rawFieldsValues.every(isString)) {
    throw new RestInputRequestParserException(
      `'fields' parameter invalid. Expected a comma-separated list of field names, e.g. fields=id,name`,
      RestInputRequestParserExceptionCode.INVALID_FIELDS_QUERY_PARAM,
    );
  }

  const fieldNames = [
    ...new Set(
      rawFieldsValues
        .flatMap((rawFieldsValue) => rawFieldsValue.split(','))
        .map((fieldName) => fieldName.trim())
        .filter(isNonEmptyString),
    ),
  ];

  if (fieldNames.length === 0) {
    throw new RestInputRequestParserException(
      `'fields' parameter is empty. Expected a comma-separated list of field names, e.g. fields=id,name`,
      RestInputRequestParserExceptionCode.INVALID_FIELDS_QUERY_PARAM,
    );
  }

  const readableFieldNames = new Set(
    flatObjectMetadata.fieldIds
      .map((fieldId) =>
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          flatEntityId: fieldId,
        }),
      )
      .filter((flatField) => restrictedFields[flatField.id]?.canRead !== false)
      .map((flatField) => flatField.name),
  );

  const invalidFieldNames = fieldNames.filter(
    (fieldName) => !readableFieldNames.has(fieldName),
  );

  if (invalidFieldNames.length > 0) {
    throw new RestInputRequestParserException(
      `'fields' parameter invalid. Unknown or unreadable fields on '${flatObjectMetadata.nameSingular}': ${invalidFieldNames.join(', ')}`,
      RestInputRequestParserExceptionCode.INVALID_FIELDS_QUERY_PARAM,
    );
  }

  return fieldNames;
};
