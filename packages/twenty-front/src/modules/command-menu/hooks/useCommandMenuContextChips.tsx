import { CommandMenuContextChipIconWrapper } from '@/command-menu/components/CommandMenuContextChipIconWrapper';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreIdentifiersFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifiersSelector';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const useCommandMenuContextChips = () => {
  const { theme } = useContext(ThemeContext);
  const iconSizeSm = theme.icon.size.sm;
  const commandMenuNavigationStack = useAtomStateValue(
    commandMenuNavigationStackState,
  );

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const { navigateCommandMenuHistory } = useCommandMenuHistory();

  const commandMenuNavigationMorphItemsByPage = useAtomStateValue(
    commandMenuNavigationMorphItemsByPageState,
  );

  const allRecordIds = Array.from(
    commandMenuNavigationMorphItemsByPage.entries(),
  ).flatMap(([, morphItems]) =>
    morphItems.map((morphItem) => morphItem.recordId),
  );

  const recordIdentifiers = useAtomFamilySelectorValue(
    recordStoreIdentifiersFamilySelector,
    {
      recordIds: allRecordIds,
      allowRequestsToTwentyIcons,
    },
  );
  const records = useAtomFamilySelectorValue(recordStoreRecordsSelector, {
    recordIds: allRecordIds,
  });

  const contextChips = useMemo(() => {
    const filteredCommandMenuNavigationStack =
      commandMenuNavigationStack.filter(
        (page) => page.page !== CommandMenuPages.Root,
      );

    return filteredCommandMenuNavigationStack
      .map((page, index) => {
        const isLastChip =
          index === filteredCommandMenuNavigationStack.length - 1;

        const isRecordPage = page.page === CommandMenuPages.ViewRecord;

        if (isRecordPage && !isLastChip) {
          const commandMenuNavigationMorphItem =
            commandMenuNavigationMorphItemsByPage.get(page.pageId)?.[0];

          if (!isDefined(commandMenuNavigationMorphItem?.recordId)) {
            return null;
          }

          const objectMetadataItem = objectMetadataItems.find(
            (item) =>
              item.id === commandMenuNavigationMorphItem.objectMetadataId,
          );

          const recordIdentifier = recordIdentifiers.find(
            (recordIdentifier) =>
              recordIdentifier.id === commandMenuNavigationMorphItem.recordId,
          );

          const record = records.find(
            (record) => record.id === commandMenuNavigationMorphItem.recordId,
          );

          if (
            !isDefined(objectMetadataItem) ||
            !isDefined(recordIdentifier) ||
            !isDefined(record)
          ) {
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
            text: recordIdentifier.name,
            onClick: () => {
              navigateCommandMenuHistory(index);
            },
          };
        }

        return {
          page,
          Icons: isLastChip
            ? [<page.pageIcon size={iconSizeSm} />]
            : [
                <CommandMenuContextChipIconWrapper>
                  <page.pageIcon
                    size={iconSizeSm}
                    color={
                      isDefined(page.pageIconColor) &&
                      page.pageIconColor !== 'currentColor'
                        ? page.pageIconColor
                        : themeCssVariables.font.color.tertiary
                    }
                  />
                </CommandMenuContextChipIconWrapper>,
              ],
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
    commandMenuNavigationMorphItemsByPage,
    commandMenuNavigationStack,
    iconSizeSm,
    navigateCommandMenuHistory,
    objectMetadataItems,
    recordIdentifiers,
    records,
  ]);

  return {
    contextChips,
  };
};
