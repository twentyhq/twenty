import { BadRequestException } from '@nestjs/common';

import { Conjunctions } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils';
import { type FieldValue } from 'src/engine/api/rest/core/types/field-value.type';
import { formatFieldValue } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/format-field-values.util';
import { parseBaseFilter } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-base-filter.util';
import { parseFilterContent } from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/parse-filter-content.util';

//TODO : Refacto-common - Rename after deleting parseFilter
export const parseFilterWithoutMetadataValidation = (
  filterQuery: string,
): Record<string, FieldValue> => {
  const result = {};
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
      parseFilterWithoutMetadataValidation(elem),
    );

    if (conjunction === Conjunctions.not) {
      if (subResult.length > 1) {
        throw new BadRequestException(
          `'filter' invalid. 'not' conjunction should contain only 1 condition. eg: not(field[eq]:1)`,
        );
      }
      // @ts-expect-error legacy noImplicitAny
      result[conjunction] = subResult[0];
    } else {
      // @ts-expect-error legacy noImplicitAny
      result[conjunction] = subResult;
    }

    return result;
  }
  const { fields, comparator, value } = parseBaseFilter(filterQuery);

  const formattedValue = formatFieldValue(value, undefined, comparator);

  return fields.reverse().reduce(
    (acc, currentValue) => {
      return { [currentValue]: acc };
    },
    { [comparator]: formattedValue },
  );
};
