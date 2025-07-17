import isEmpty from 'lodash.isempty';

import {
  ObjectRecord,
  ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { settings } from 'src/engine/constants/settings';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { getCompositeFieldMetadataMap } from 'src/engine/twenty-orm/utils/format-result.util';

export const buildDuplicateConditions = (
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  records?: Partial<ObjectRecord>[] | undefined,
  filteringByExistingRecordId?: string,
): Partial<ObjectRecordFilter> => {
  if (!records || records.length === 0) {
    return {};
  }

  const criteriaCollection =
    objectMetadataItemWithFieldMaps.duplicateCriteria || [];

  const formattedRecords = formatData(records, objectMetadataItemWithFieldMaps);

  const compositeFieldMetadataMap = getCompositeFieldMetadataMap(
    objectMetadataItemWithFieldMaps,
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
