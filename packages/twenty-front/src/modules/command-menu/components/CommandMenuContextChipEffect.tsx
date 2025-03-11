import { commandMenuNavigationMorphItemsState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuNavigationRecordsState } from '@/command-menu/states/commandMenuNavigationRecordsState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { usePerformCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/usePerformCombinedFindManyRecords';
import { isNonEmptyArray } from '@sniptt/guards';
import { useCallback, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared';

export const CommandMenuContextChipEffect = () => {
  const commandMenuNavigationMorphItems = useRecoilValue(
    commandMenuNavigationMorphItemsState,
  );

  const setCommandMenuNavigationRecords = useSetRecoilState(
    commandMenuNavigationRecordsState,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { performCombinedFindManyRecords } =
    usePerformCombinedFindManyRecords();

  const objectMetadataIds = Array.from(
    commandMenuNavigationMorphItems.values(),
  ).map(({ objectMetadataId }) => objectMetadataId);

  const searchableObjectMetadataItems = objectMetadataItems.filter(({ id }) =>
    objectMetadataIds.includes(id),
  );

  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const fetchRecords = useCallback(async () => {
    const filterPerMetadataItemFilteredOnRecordId = Object.fromEntries(
      searchableObjectMetadataItems
        .map(({ id, nameSingular }) => {
          const recordIdsForMetadataItem = Array.from(
            commandMenuNavigationMorphItems.values(),
          )
            .filter(({ objectMetadataId }) => objectMetadataId === id)
            .map(({ recordId }) => recordId);

          if (!isNonEmptyArray(recordIdsForMetadataItem)) {
            return null;
          }

          return [
            `filter${capitalize(nameSingular)}`,
            {
              id: {
                in: recordIdsForMetadataItem,
              },
            },
          ];
        })
        .filter(isDefined),
    );

    const operationSignatures = searchableObjectMetadataItems
      .filter(({ nameSingular }) =>
        isDefined(
          filterPerMetadataItemFilteredOnRecordId[
            `filter${capitalize(nameSingular)}`
          ],
        ),
      )
      .map((objectMetadataItem) => ({
        objectNameSingular: objectMetadataItem.nameSingular,
        variables: {
          filter:
            filterPerMetadataItemFilteredOnRecordId[
              `filter${capitalize(objectMetadataItem.nameSingular)}`
            ],
          limit: 10,
        },
      }));

    if (operationSignatures.length === 0) {
      setCommandMenuNavigationRecords([]);
      return;
    }

    const { result } = await performCombinedFindManyRecords({
      operationSignatures,
    });

    const formattedRecords = Object.entries(result).flatMap(
      ([objectNamePlural, records]) =>
        records.map((record) => ({
          objectMetadataItem: searchableObjectMetadataItems.find(
            ({ namePlural }) => namePlural === objectNamePlural,
          ) as ObjectMetadataItem,
          record: record as RecordGqlNode,
        })),
    );

    setCommandMenuNavigationRecords(formattedRecords);
  }, [
    commandMenuNavigationMorphItems,
    performCombinedFindManyRecords,
    searchableObjectMetadataItems,
    setCommandMenuNavigationRecords,
  ]);

  useEffect(() => {
    if (commandMenuNavigationStack.length > 1) {
      fetchRecords();
    }

    return () => {
      setCommandMenuNavigationRecords([]);
    };
  }, [
    commandMenuNavigationMorphItems,
    commandMenuNavigationStack.length,
    fetchRecords,
    setCommandMenuNavigationRecords,
  ]);

  return null;
};
