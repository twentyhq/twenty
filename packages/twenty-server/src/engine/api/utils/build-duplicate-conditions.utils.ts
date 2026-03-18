import isEmpty from 'lodash.isempty';
import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { settings } from 'src/engine/constants/settings';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { getCompositeFieldMetadataMap } from 'src/engine/twenty-orm/utils/format-result.util';

export const normalizeStringForDuplicateComparison = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const escapeForILike = (value: string): string =>
  value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');

const buildLevenshteinDistance = (left: string, right: string): number => {
  if (left === right) {
    return 0;
  }

  if (left.length === 0) {
    return right.length;
  }

  if (right.length === 0) {
    return left.length;
  }

  const previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);
  const currentRow = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 0; leftIndex < left.length; leftIndex++) {
    currentRow[0] = leftIndex + 1;

    for (let rightIndex = 0; rightIndex < right.length; rightIndex++) {
      const substitutionCost =
        left[leftIndex] === right[rightIndex] ? 0 : 1;

      currentRow[rightIndex + 1] = Math.min(
        currentRow[rightIndex] + 1,
        previousRow[rightIndex + 1] + 1,
        previousRow[rightIndex] + substitutionCost,
      );
    }

    previousRow.splice(0, previousRow.length, ...currentRow);
  }

  return previousRow[right.length];
};

export const calculateNormalizedStringSimilarity = (
  left: string,
  right: string,
): number => {
  const normalizedLeft = normalizeStringForDuplicateComparison(left);
  const normalizedRight = normalizeStringForDuplicateComparison(right);

  if (normalizedLeft.length === 0 && normalizedRight.length === 0) {
    return 1;
  }

  if (normalizedLeft.length === 0 || normalizedRight.length === 0) {
    return 0;
  }

  const maxLength = Math.max(normalizedLeft.length, normalizedRight.length);

  return (
    1 - buildLevenshteinDistance(normalizedLeft, normalizedRight) / maxLength
  );
};

const buildFuzzyCompanyNameCondition = (value: string) => {
  const normalizedTokens = Array.from(
    new Set(
      normalizeStringForDuplicateComparison(value)
        .split(' ')
        .filter(
          (token) =>
            token.length >= settings.minLengthOfStringForDuplicateCheck,
        ),
    ),
  );

  return {
    or: [
      { name: { eq: value } },
      ...normalizedTokens.map((token) => ({
        name: { ilike: `%${escapeForILike(token)}%` },
      })),
    ],
  };
};

export const buildDuplicateConditions = (
  flatObjectMetadata: FlatObjectMetadata,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  records?: Partial<ObjectRecord>[] | undefined,
  filteringByExistingRecordId?: string,
): Partial<ObjectRecordFilter> => {
  if (!records || records.length === 0) {
    return {};
  }

  const criteriaCollection = flatObjectMetadata.duplicateCriteria || [];

  const formattedRecords = formatData(
    records,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const compositeFieldMetadataMap = getCompositeFieldMetadataMap(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const conditions = formattedRecords.flatMap((record) => {
    const criteriaWithMatchingArgs = criteriaCollection.filter((criteria) =>
      criteria.every((columnName) => {
        const value = record[columnName] as string | undefined;

        return (
          value && value.length >= settings.minLengthOfStringForDuplicateCheck
        );
      }),
    );

    return criteriaWithMatchingArgs.map((criteria) => {
      const condition = {};

      if (
        flatObjectMetadata.nameSingular === 'company' &&
        criteria.length === 1 &&
        criteria[0] === 'name'
      ) {
        return buildFuzzyCompanyNameCondition(record.name as string);
      }

      criteria.forEach((columnName) => {
        const compositeFieldMetadata =
          compositeFieldMetadataMap.get(columnName);

        if (compositeFieldMetadata) {
          // @ts-expect-error legacy noImplicitAny
          condition[compositeFieldMetadata.parentField] = {
            // @ts-expect-error legacy noImplicitAny
            ...condition[compositeFieldMetadata.parentField],
            [compositeFieldMetadata.name]: { eq: record[columnName] },
          };
        } else {
          // @ts-expect-error legacy noImplicitAny
          condition[columnName] = { eq: record[columnName] };
        }
      });

      return condition;
    });
  });

  const filter: Partial<ObjectRecordFilter> = {};

  if (conditions && !isEmpty(conditions)) {
    filter.or = conditions;

    if (filteringByExistingRecordId) {
      filter.id = { neq: filteringByExistingRecordId };
    }
  }

  return filter;
};
