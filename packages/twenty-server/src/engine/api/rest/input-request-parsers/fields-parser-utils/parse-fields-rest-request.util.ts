import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isOneToManyRelationFlatField } from 'src/engine/api/common/common-select-fields/utils/is-one-to-many-relation-flat-field.util';
import {
  RestInputRequestParserException,
  RestInputRequestParserExceptionCode,
} from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { type Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const parseFieldsRestRequest = ({
  request,
  objectNameSingular,
  readableFlatFields,
  depth,
}: {
  request: Pick<AuthenticatedRequest, 'query'>;
  objectNameSingular: string;
  readableFlatFields: Pick<
    OrmFlatFieldMetadata,
    'name' | 'type' | 'settings'
  >[];
  depth: Depth | undefined;
}): ReadonlySet<string> | undefined => {
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

  const readableFlatFieldByName = new Map(
    readableFlatFields.map((flatField) => [flatField.name, flatField]),
  );

  const invalidFieldNames = fieldNames.filter(
    (fieldName) => !readableFlatFieldByName.has(fieldName),
  );

  if (invalidFieldNames.length > 0) {
    throw new RestInputRequestParserException(
      `'fields' parameter invalid. Unknown or unreadable fields on '${objectNameSingular}': ${invalidFieldNames.join(', ')}`,
      RestInputRequestParserExceptionCode.INVALID_FIELDS_QUERY_PARAM,
    );
  }

  const isRelationExpansionDisabled = !isDefined(depth) || depth === 0;

  const oneToManyRelationFieldNames = isRelationExpansionDisabled
    ? fieldNames.filter((fieldName) => {
        const flatField = readableFlatFieldByName.get(fieldName);

        return isDefined(flatField) && isOneToManyRelationFlatField(flatField);
      })
    : [];

  if (oneToManyRelationFieldNames.length > 0) {
    throw new RestInputRequestParserException(
      `'fields' parameter invalid. One-to-many relation fields on '${objectNameSingular}' are only returned with depth=1: ${oneToManyRelationFieldNames.join(', ')}`,
      RestInputRequestParserExceptionCode.INVALID_FIELDS_QUERY_PARAM,
    );
  }

  return new Set(['id', ...fieldNames]);
};
