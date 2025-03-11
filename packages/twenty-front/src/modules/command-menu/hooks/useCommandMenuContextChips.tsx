import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuNavigationMorphItemsState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuNavigationRecordsState } from '@/command-menu/states/commandMenuNavigationRecordsState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useTheme } from '@emotion/react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useContextChips = () => {
  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const { navigateCommandMenuHistory } = useCommandMenu();

  const theme = useTheme();

  const commandMenuNavigationMorphItems = useRecoilValue(
    commandMenuNavigationMorphItemsState,
  );

  const commandMenuNavigationRecords = useRecoilValue(
    commandMenuNavigationRecordsState,
  );

  const contextChips = useMemo(() => {
    const filteredCommandMenuNavigationStack =
      commandMenuNavigationStack.filter(
        (page) => page.page !== CommandMenuPages.Root,
      );

    return filteredCommandMenuNavigationStack
      .map((page, index) => {
        const isLastChip =
          index === filteredCommandMenuNavigationStack.length - 1;

        const isRecordPage =
          page.page === CommandMenuPages.ViewRecord ||
          page.page === CommandMenuPages.ViewEmailThread ||
          page.page === CommandMenuPages.ViewCalendarEvent;

        if (isRecordPage && !isLastChip) {
          const commandMenuNavigationMorphItem =
            commandMenuNavigationMorphItems.get(page.pageId);

          if (!isDefined(commandMenuNavigationMorphItem?.recordId)) {
            return null;
          }

          const objectMetadataItem = commandMenuNavigationRecords.find(
            ({ objectMetadataItem }) =>
              objectMetadataItem.id ===
              commandMenuNavigationMorphItem.objectMetadataId,
          )?.objectMetadataItem;

          const record = commandMenuNavigationRecords.find(
            ({ record }) =>
              record.id === commandMenuNavigationMorphItem.recordId,
          )?.record;

          if (!isDefined(objectMetadataItem) || !isDefined(record)) {
            return null;
          }

          return {
            page,
            Icons: [
              <CommandMenuContextRecordChipAvatars
                objectMetadataItem={objectMetadataItem}
                record={record}
              />,
            ],
            text: getObjectRecordIdentifier({
              objectMetadataItem,
              record,
            }).name,
            onClick: isLastChip
              ? undefined
              : () => {
                  navigateCommandMenuHistory(index);
                },
          };
        }

        return {
          page,
          Icons: [<page.pageIcon size={theme.icon.size.sm} />],
          text: page.pageTitle,
          onClick: isLastChip
            ? undefined
            : () => {
                navigateCommandMenuHistory(index);
              },
        };
      })
      .filter(isDefined);
  }, [
    commandMenuNavigationMorphItems,
    commandMenuNavigationRecords,
    commandMenuNavigationStack,
    navigateCommandMenuHistory,
    theme.icon.size.sm,
  ]);

  return {
    contextChips,
  };
};
