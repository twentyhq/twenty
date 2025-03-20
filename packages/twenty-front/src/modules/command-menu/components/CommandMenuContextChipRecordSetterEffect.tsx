import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuNavigationRecordsState } from '@/command-menu/states/commandMenuNavigationRecordsState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { useApolloClient } from '@apollo/client';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';

export const CommandMenuContextChipRecordSetterEffect = () => {
  const commandMenuNavigationMorphItemByPage = useRecoilValue(
    commandMenuNavigationMorphItemByPageState,
  );

  const setCommandMenuNavigationRecords = useSetRecoilState(
    commandMenuNavigationRecordsState,
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const apolloClient = useApolloClient();

  useEffect(() => {
    if (commandMenuNavigationStack.length > 1) {
      const morphItems = Array.from(
        commandMenuNavigationMorphItemByPage.values(),
      );

      const records = morphItems
        .map((morphItem) => {
          const objectMetadataItem = objectMetadataItems.find(
            ({ id }) => id === morphItem.objectMetadataId,
          );

          if (!objectMetadataItem) {
            return null;
          }

          const record = getRecordFromCache({
            recordId: morphItem.recordId,
            cache: apolloClient.cache,
            objectMetadataItems,
            objectMetadataItem,
          });

          if (!record) {
            return null;
          }

          return {
            objectMetadataItem,
            record,
          };
        })
        .filter(isDefined);

      setCommandMenuNavigationRecords(records);
    }
  }, [
    apolloClient.cache,
    commandMenuNavigationMorphItemByPage,
    commandMenuNavigationStack,
    commandMenuNavigationStack.length,
    objectMetadataItems,
    setCommandMenuNavigationRecords,
  ]);

  return null;
};
