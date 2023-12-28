import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNameSingularMapSelector } from '@/object-metadata/states/objectMetadataItemsByNameSingularMapSelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectOrderByField } from '@/object-metadata/utils/getObjectOrderByField';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

type SearchFilter = { fieldNames: string[]; filter: string | number };

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

// TODO: use this for all search queries, because we need selectedEntities and entitiesToSelect each time we want to search
// Filtered entities to select are

export type ObjectRecordForSelect = {
  objectNameSingular: string;
  record: ObjectRecord;
};

export type SelectedObjectRecordId = {
  objectNameSingular: string;
  id: string;
};

export type MultiObjectSearch = {
  selectedObjectRecords: ObjectRecordForSelect[];
};

export const useMultiObjectSearch = ({
  searchFilterValue,
  selectedObjectRecordIds,
  limit,
  excludedObjectRecordIds = [],
}: {
  searchFilterValue: string;
  selectedObjectRecordIds: SelectedObjectRecordId[];
  limit?: number;
  excludedObjectRecordIds?: SelectedObjectRecordId[];
}): MultiObjectSearch => {
  const objectMetadataItemsByNameSingularMap = useRecoilValue(
    objectMetadataItemsByNameSingularMapSelector,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const nonSystemObjectMetadataItems = objectMetadataItems.filter(
    ({ isSystem }) => !isSystem,
  );

  const multiSelectQuery =
    useGenerateFindManyRecordsForMultipleMetadataItemsQuery({
      objectMetadataItems: nonSystemObjectMetadataItems,
    });

  const orderByFieldPerMetadataItem = Object.fromEntries(
    nonSystemObjectMetadataItems
      .map(({ nameSingular }) => {
        const objectMetadataItem =
          objectMetadataItemsByNameSingularMap.get(nameSingular);

        if (!isDefined(objectMetadataItem)) return null;

        const orderByField = getObjectOrderByField(
          objectMetadataItem,
          'AscNullsLast',
        );

        return [
          `orderBy${capitalize(nameSingular)}`,
          {
            ...orderByField,
          },
        ];
      })
      .filter(isDefined),
  );

  const selectedIdFilterPerMetadataItem = Object.fromEntries(
    nonSystemObjectMetadataItems
      .map(({ nameSingular }) => {
        const objectMetadataItem =
          objectMetadataItemsByNameSingularMap.get(nameSingular);

        if (!isDefined(objectMetadataItem)) return null;

        const selectedIds = selectedObjectRecordIds
          .filter(
            ({ objectNameSingular }) => objectNameSingular === nameSingular,
          )
          .map(({ id }) => id);

        if (!isNonEmptyArray(selectedIds)) return null;

        return [
          `filter${capitalize(nameSingular)}`,
          {
            id: {
              in: selectedIds,
            },
          },
        ];
      })
      .filter(isDefined),
  );

  const { loading: selectedEntitiesLoading, data: selectedObjectRecords } =
    useQuery(multiSelectQuery, {
      variables: {
        ...selectedIdFilterPerMetadataItem,
        ...orderByFieldPerMetadataItem,
      },
    });

  console.log({
    selectedObjectRecords,
  });

  // const searchFilter = filters
  //   .map(({ fieldNames, filter }) => {
  //     if (!isNonEmptyString(filter)) {
  //       return undefined;
  //     }

  //     return {
  //       or: fieldNames.map((fieldName) => {
  //         const fieldNameParts = fieldName.split('.');

  //         if (fieldNameParts.length > 1) {
  //           // Composite field

  //           return {
  //             [fieldNameParts[0]]: {
  //               [fieldNameParts[1]]: {
  //                 ilike: `%${filter}%`,
  //               },
  //             },
  //           };
  //         }
  //         return {
  //           [fieldName]: {
  //             ilike: `%${filter}%`,
  //           },
  //         };
  //       }),
  //     };
  //   })
  //   .filter(isDefined);

  // const {
  //   loading: filteredSelectedEntitiesLoading,
  //   data: filteredSelectedEntitiesData,
  // } = queryHook({
  //   variables: {
  //     filter: {
  //       and: [
  //         {
  //           and: searchFilter,
  //         },
  //         {
  //           id: {
  //             in: selectedIds,
  //           },
  //         },
  //       ],
  //     },
  //     orderBy: {
  //       [orderByField]: sortOrder,
  //     },
  //   } as any,
  // });

  // const { loading: entitiesToSelectLoading, data: entitiesToSelectData } =
  //   queryHook({
  //     variables: {
  //       filter: {
  //         and: [
  //           {
  //             and: searchFilter,
  //           },
  //           {
  //             not: {
  //               id: {
  //                 in: [...selectedIds, ...excludeEntityIds],
  //               },
  //             },
  //           },
  //         ],
  //       },
  //       limit: limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
  //       orderBy: {
  //         [orderByField]: sortOrder,
  //       },
  //     } as any,
  //   });

  return {
    selectedObjectRecords,
    // filteredSelectedEntities: mapPaginatedRecordsToRecords({
    //   objectNamePlural: objectMetadataItem.namePlural,
    //   pagedRecords: filteredSelectedEntitiesData,
    // })
    //   .map(mappingFunction)
    //   .filter(assertNotNull),
    // entitiesToSelect: mapPaginatedRecordsToRecords({
    //   objectNamePlural: objectMetadataItem.namePlural,
    //   pagedRecords: entitiesToSelectData,
    // })
    //   .map(mappingFunction)
    //   .filter(assertNotNull),
    // loading:
    //   entitiesToSelectLoading ||
    //   filteredSelectedEntitiesLoading ||
    //   selectedEntitiesLoading,
  };
};
