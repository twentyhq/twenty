import isEmpty from 'lodash.isempty';
import { type ObjectRecord } from 'twenty-shared/types';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { settings } from 'src/engine/constants/settings';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { getCompositeFieldMetadataMap } from 'src/engine/twenty-orm/utils/format-result.util';

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
