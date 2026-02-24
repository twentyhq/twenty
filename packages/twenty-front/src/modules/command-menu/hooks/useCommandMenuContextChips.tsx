import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { CommandMenuPages } from 'twenty-shared/types';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreIdentifiersFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifiersSelector';
import { recordStoreRecordsSelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelectorV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

const StyledIconWrapper = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const useCommandMenuContextChips = () => {
  const commandMenuNavigationStack = useAtomValue(
    commandMenuNavigationStackState,
  );

  const allowRequestsToTwentyIcons = useAtomValue(
    allowRequestsToTwentyIconsState,
  );

  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

  const { navigateCommandMenuHistory } = useCommandMenuHistory();

  const theme = useTheme();

  const commandMenuNavigationMorphItemsByPage = useAtomValue(
    commandMenuNavigationMorphItemsByPageState,
  );

  const allRecordIds = Array.from(
    commandMenuNavigationMorphItemsByPage.entries(),
  ).flatMap(([, morphItems]) =>
    morphItems.map((morphItem) => morphItem.recordId),
  );

  const recordIdentifiers = useFamilySelectorValue(
    recordStoreIdentifiersFamilySelector,
    {
      recordIds: allRecordIds,
      allowRequestsToTwentyIcons,
    },
  );
  const records = useFamilySelectorValue(recordStoreRecordsSelectorV2, {
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
            ? [<page.pageIcon size={theme.icon.size.sm} />]
            : [
                <StyledIconWrapper>
                  <page.pageIcon
                    size={theme.icon.size.sm}
                    color={
                      isDefined(page.pageIconColor) &&
                      page.pageIconColor !== 'currentColor'
                        ? page.pageIconColor
                        : theme.font.color.tertiary
                    }
                  />
                </StyledIconWrapper>,
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
    navigateCommandMenuHistory,
    objectMetadataItems,
    recordIdentifiers,
    records,
    theme.font.color.tertiary,
    theme.icon.size.sm,
  ]);

  return {
    contextChips,
  };
};
