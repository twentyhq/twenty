import { BadRequestException } from '@nestjs/common';

import { checkFields } from 'src/engine/api/rest/core/query-builder/utils/check-fields.utils';
import { getFieldType } from 'src/engine/api/rest/core/query-builder/utils/get-field-type.utils';
import { type FieldValue } from 'src/engine/api/rest/core/types/field-value.type';
import { checkFilterEnumValues } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/check-filter-enum-values.util';
import { formatFieldValue } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/format-field-values.util';
import { parseBaseFilter } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-base-filter.util';
import { parseFilterContent } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-content.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export enum Conjunctions {
  or = 'or',
  and = 'and',
  not = 'not',
}

export const parseFilter = (
  filterQuery: string,
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
): Record<string, FieldValue> => {
  const result: Record<string, FieldValue> = {};
  const match = filterQuery.match(
    `^(${Object.values(Conjunctions).join('|')})\\((.+)\\)$`,
  );

  if (match) {
    const conjunction = match?.[1];

    if (!conjunction) {
      throw new BadRequestException(
        'Error while matching filter query. Conjunction not found',
      );
    }
    const subResult = parseFilterContent(filterQuery).map((elem) =>
      parseFilter(elem, objectMetadataItem),
    );

    if (conjunction === Conjunctions.not) {
      if (subResult.length > 1) {
        throw new BadRequestException(
          `'filter' invalid. 'not' conjunction should contain only 1 condition. eg: not(field[eq]:1)`,
        );
      }
      result[conjunction] = subResult[0];
    } else {
      result[conjunction] = subResult;
    }

    return result;
  }
  const { fields, comparator, value } = parseBaseFilter(filterQuery);

  const fieldName = fields[0];

  checkFields(objectMetadataItem, fields);
  const fieldType = getFieldType(objectMetadataItem, fieldName);

  checkFilterEnumValues(fieldType, fieldName, value, objectMetadataItem);

  const formattedValue = formatFieldValue(value, fieldType, comparator);

  return fields.reverse().reduce(
    (acc, currentValue) => {
      return { [currentValue]: acc };
    },
    { [comparator]: formattedValue },
  );
};
