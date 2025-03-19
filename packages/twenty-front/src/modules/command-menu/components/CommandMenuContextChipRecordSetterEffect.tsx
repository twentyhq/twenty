import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
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

export const CommandMenuContextChipRecordSetterEffect = () => {
  const commandMenuNavigationMorphItemByPage = useRecoilValue(
    commandMenuNavigationMorphItemByPageState,
  );

  const setCommandMenuNavigationRecords = useSetRecoilState(
    commandMenuNavigationRecordsState,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { performCombinedFindManyRecords } =
    usePerformCombinedFindManyRecords();

  const objectMetadataIdsUsedInCommandMenuNavigation = Array.from(
    commandMenuNavigationMorphItemByPage.values(),
  ).map(({ objectMetadataId }) => objectMetadataId);

  const searchableObjectMetadataItems = objectMetadataItems.filter(({ id }) =>
    objectMetadataIdsUsedInCommandMenuNavigation.includes(id),
  );

  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const fetchRecords = useCallback(async () => {
    const filterPerMetadataItemFilteredOnRecordId = Object.fromEntries(
      searchableObjectMetadataItems
        .map(({ id, nameSingular }) => {
          const recordIdsForMetadataItem = Array.from(
            commandMenuNavigationMorphItemByPage.values(),
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
    commandMenuNavigationMorphItemByPage,
    performCombinedFindManyRecords,
    searchableObjectMetadataItems,
    setCommandMenuNavigationRecords,
  ]);

  useEffect(() => {
    if (commandMenuNavigationStack.length > 1) {
      fetchRecords();
    }
  }, [commandMenuNavigationStack.length, fetchRecords]);

  return null;
};
