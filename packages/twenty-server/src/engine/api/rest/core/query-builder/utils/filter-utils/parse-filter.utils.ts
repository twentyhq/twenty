import { BadRequestException } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { parseFilterContent } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter-content.utils';
import { parseBaseFilter } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-base-filter.utils';
import { checkFields } from 'src/engine/api/rest/core/query-builder/utils/check-fields.utils';
import { formatFieldValue } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/format-field-values.utils';
import { FieldValue } from 'src/engine/api/rest/core/types/field-value.type';
import { checkFilterEnumValues } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/check-filter-enum-values';
import { getFieldType } from 'src/engine/api/rest/core/query-builder/utils/get-field-type.utils';

export enum Conjunctions {
  or = 'or',
  and = 'and',
  not = 'not',
}

export const parseFilter = (
  filterQuery: string,
  objectMetadataItem: ObjectMetadataInterface,
): Record<string, FieldValue> => {
  const result = {};
  const match = filterQuery.match(
    `^(${Object.values(Conjunctions).join('|')})((.+))$`,
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
