import { SidePanelContextChipIconWrapper } from '@/side-panel/components/SidePanelContextChipIconWrapper';
import { SidePanelContextRecordChipAvatars } from '@/side-panel/components/SidePanelContextRecordChipAvatars';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreIdentifiersFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifiersSelector';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme';

export const useSidePanelContextChips = () => {
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const { navigateSidePanelHistory } = useSidePanelHistory();

  const { theme } = useContext(ThemeContext);

  const sidePanelNavigationMorphItemsByPage = useAtomStateValue(
    sidePanelNavigationMorphItemsByPageState,
  );

  const allRecordIds = Array.from(
    sidePanelNavigationMorphItemsByPage.entries(),
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
    const filteredSidePanelNavigationStack = sidePanelNavigationStack.filter(
      (page) => page.page !== SidePanelPages.Root,
    );

    return filteredSidePanelNavigationStack
      .map((page, index) => {
        const isLastChip = index === filteredSidePanelNavigationStack.length - 1;

        const isRecordPage = page.page === SidePanelPages.ViewRecord;

        if (isRecordPage && !isLastChip) {
          const sidePanelNavigationMorphItem =
            sidePanelNavigationMorphItemsByPage.get(page.pageId)?.[0];

          if (!isDefined(sidePanelNavigationMorphItem?.recordId)) {
            return null;
          }

          const objectMetadataItem = objectMetadataItems.find(
            (item) => item.id === sidePanelNavigationMorphItem.objectMetadataId,
          );

          const recordIdentifier = recordIdentifiers.find(
            (recordIdentifier) =>
              recordIdentifier.id === sidePanelNavigationMorphItem.recordId,
          );

          const record = records.find(
            (record) => record.id === sidePanelNavigationMorphItem.recordId,
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
              <SidePanelContextRecordChipAvatars
                objectMetadataItem={objectMetadataItem}
                record={record}
              />,
            ],
            text: recordIdentifier.name,
            onClick: () => {
              navigateSidePanelHistory(index);
            },
          };
        }

        return {
          page,
          Icons: isLastChip
            ? [<page.pageIcon size={theme.icon.size.sm} />]
            : [
                <SidePanelContextChipIconWrapper>
                  <page.pageIcon
                    size={theme.icon.size.sm}
                    color={
                      isDefined(page.pageIconColor) &&
                      page.pageIconColor !== 'currentColor'
                        ? page.pageIconColor
                        : theme.font.color.tertiary
                    }
                  />
                </SidePanelContextChipIconWrapper>,
              ],
          text: page.pageTitle,
          onClick: isLastChip
            ? undefined
            : () => {
                navigateSidePanelHistory(index);
              },
        };
      })
      .filter(isDefined);
  }, [
    sidePanelNavigationMorphItemsByPage,
    sidePanelNavigationStack,
    navigateSidePanelHistory,
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
