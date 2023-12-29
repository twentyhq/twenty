import { useQuery } from '@apollo/client';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsByNameSingularMapSelector } from '@/object-metadata/states/objectMetadataItemsByNameSingularMapSelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getObjectOrderByField } from '@/object-metadata/utils/getObjectOrderByField';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import {
  MultiObjectRecordQueryResult,
  useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray,
} from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const DEFAULT_SEARCH_REQUEST_LIMIT = 5;

export type ObjectRecordForSelect = {
  objectMetadataItem: ObjectMetadataItem;
  record: ObjectRecord;
  recordIdentifier: ObjectRecordIdentifier;
};

export type SelectedObjectRecordId = {
  objectNameSingular: string;
  id: string;
};

export type MultiObjectSearch = {
  selectedObjectRecords: ObjectRecordForSelect[];
  filteredSelectedObjectRecords: ObjectRecordForSelect[];
  objectRecordsToSelect: ObjectRecordForSelect[];
  loading: boolean;
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

        const orderByField = getObjectOrderByField(objectMetadataItem);

        return [
          `orderBy${capitalize(nameSingular)}`,
          {
            ...orderByField,
          },
        ];
      })
      .filter(isDefined),
  );

  const limitPerMetadataItem = Object.fromEntries(
    nonSystemObjectMetadataItems
      .map(({ nameSingular }) => {
        const objectMetadataItem =
          objectMetadataItemsByNameSingularMap.get(nameSingular);

        if (!isDefined(objectMetadataItem)) return null;

        return [
          `limit${capitalize(nameSingular)}`,
          limit ?? DEFAULT_SEARCH_REQUEST_LIMIT,
        ];
      })
      .filter(isDefined),
  );

  const searchFilterPerMetadataItemNameSingular =
    Object.fromEntries<ObjectRecordQueryFilter>(
      nonSystemObjectMetadataItems
        .map(({ nameSingular }) => {
          const objectMetadataItem =
            objectMetadataItemsByNameSingularMap.get(nameSingular);

          if (!isDefined(objectMetadataItem)) return null;

          const labelIdentifierFieldMetadataItem =
            getLabelIdentifierFieldMetadataItem(objectMetadataItem);

          let searchFilter: ObjectRecordQueryFilter = {};

          if (labelIdentifierFieldMetadataItem) {
            switch (labelIdentifierFieldMetadataItem.type) {
              case FieldMetadataType.FullName: {
                searchFilter = {
                  or: [
                    {
                      [labelIdentifierFieldMetadataItem.name]: {
                        firstName: {
                          ilike: `%${searchFilterValue}%`,
                        },
                      },
                    },
                    {
                      [labelIdentifierFieldMetadataItem.name]: {
                        lastName: {
                          ilike: `%${searchFilterValue}%`,
                        },
                      },
                    },
                  ],
                };
                break;
              }
              default:
                searchFilter = {
                  [labelIdentifierFieldMetadataItem.name]: {
                    ilike: `%${searchFilterValue}%`,
                  },
                };
            }
          }

          return [nameSingular, searchFilter] as const;
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

  const {
    loading: selectedEntitiesLoading,
    data: selectedObjectRecordsQueryResult,
  } = useQuery<MultiObjectRecordQueryResult>(multiSelectQuery, {
    variables: {
      ...selectedIdFilterPerMetadataItem,
      ...orderByFieldPerMetadataItem,
      ...limitPerMetadataItem,
    },
  });

  const { objectRecordForSelectArray: selectedObjectRecords } =
    useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
      multiObjectRecordsQueryResult: selectedObjectRecordsQueryResult,
    });

  console.log({
    selectedObjectRecords,
  });

  const selectedAndMatchesSearchFilterTextFilterPerMetadataItem =
    Object.fromEntries(
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

          const searchFilter =
            searchFilterPerMetadataItemNameSingular[nameSingular] ?? {};

          return [
            `filter${capitalize(nameSingular)}`,
            {
              and: [
                {
                  ...searchFilter,
                },
                {
                  id: {
                    in: selectedIds,
                  },
                },
              ],
            },
          ];
        })
        .filter(isDefined),
    );

  const {
    loading: filteredSelectedObjectRecordsLoading,
    data: filteredSelectedObjectRecordsQueryResult,
  } = useQuery<MultiObjectRecordQueryResult>(multiSelectQuery, {
    variables: {
      ...selectedAndMatchesSearchFilterTextFilterPerMetadataItem,
      ...orderByFieldPerMetadataItem,
      ...limitPerMetadataItem,
    },
  });

  const { objectRecordForSelectArray: filteredSelectedObjectRecords } =
    useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
      multiObjectRecordsQueryResult: filteredSelectedObjectRecordsQueryResult,
    });

  const objectRecordsToSelectAndMatchesSearchFilterTextFilterPerMetadataItem =
    Object.fromEntries(
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

          const excludedIds = excludedObjectRecordIds
            .filter(
              ({ objectNameSingular }) => objectNameSingular === nameSingular,
            )
            .map(({ id }) => id);

          if (!isNonEmptyArray(selectedIds)) return null;

          const searchFilter =
            searchFilterPerMetadataItemNameSingular[nameSingular] ?? {};

          return [
            `filter${capitalize(nameSingular)}`,
            {
              and: [
                {
                  ...searchFilter,
                },
                {
                  not: {
                    id: {
                      in: [...selectedIds, ...excludedIds],
                    },
                  },
                },
              ],
            },
          ];
        })
        .filter(isDefined),
    );

  const {
    loading: objectRecordsToSelectLoading,
    data: objectRecordsToSelectQueryResult,
  } = useQuery<MultiObjectRecordQueryResult>(multiSelectQuery, {
    variables: {
      ...objectRecordsToSelectAndMatchesSearchFilterTextFilterPerMetadataItem,
      ...orderByFieldPerMetadataItem,
      ...limitPerMetadataItem,
    },
  });

  const { objectRecordForSelectArray: objectRecordsToSelect } =
    useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
      multiObjectRecordsQueryResult: objectRecordsToSelectQueryResult,
    });

  return {
    selectedObjectRecords,
    filteredSelectedObjectRecords,
    objectRecordsToSelect,
    loading:
      filteredSelectedObjectRecordsLoading ||
      selectedEntitiesLoading ||
      objectRecordsToSelectLoading,
  };
};
