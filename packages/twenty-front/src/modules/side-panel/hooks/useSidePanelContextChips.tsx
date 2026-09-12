import { SidePanelContextChipIconWrapper } from '@/side-panel/components/SidePanelContextChipIconWrapper';
import { SidePanelContextRecordChipAvatars } from '@/side-panel/components/SidePanelContextRecordChipAvatars';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { getRecordShowParamsFromPath } from '@/side-panel/routing/utils/getRecordShowParamsFromPath';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { recordStoreIdentifiersFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifiersSelector';
import { recordStoreRecordsSelector } from '@/object-record/record-store/states/selectors/recordStoreRecordsSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';
import { createPath } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const useSidePanelContextChips = () => {
  const { theme } = useContext(ThemeContext);
  const iconSizeSm = theme.icon.size.sm;
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );

  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { navigateSidePanelHistory } = useSidePanelHistory();

  const routedRecordIds = sidePanelNavigationStack.flatMap((page) => {
    if (page.page !== SidePanelPages.RoutedPage) {
      return [];
    }

    const recordShowParams = getRecordShowParamsFromPath(
      createPath(page.routedLocation),
    );

    return isDefined(recordShowParams) ? [recordShowParams.objectRecordId] : [];
  });

  const allRecordIds = Array.from(new Set(routedRecordIds));

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
    const visibleSidePanelNavigationStack = sidePanelNavigationStack
      .map((page, originalStackIndex) => ({ page, originalStackIndex }))
      .filter(({ page }) => page.page !== SidePanelPages.CommandMenuDisplay);

    return visibleSidePanelNavigationStack
      .map(({ page, originalStackIndex }, visibleIndex) => {
        const isLastChip =
          visibleIndex === visibleSidePanelNavigationStack.length - 1;

        const routedRecordShowParams =
          page.page === SidePanelPages.RoutedPage
            ? getRecordShowParamsFromPath(createPath(page.routedLocation))
            : null;

        const recordId = routedRecordShowParams?.objectRecordId;

        const objectMetadataItem = isDefined(routedRecordShowParams)
          ? objectMetadataItems.find(
              (item) =>
                item.nameSingular === routedRecordShowParams.objectNameSingular,
            )
          : undefined;

        if (isDefined(recordId) && !isLastChip) {
          const recordIdentifier = recordIdentifiers.find(
            (recordIdentifier) => recordIdentifier.id === recordId,
          );

          const record = records.find((record) => record.id === recordId);

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
              navigateSidePanelHistory(originalStackIndex);
            },
          };
        }

        return {
          page,
          Icons: isLastChip
            ? [<page.pageIcon size={iconSizeSm} />]
            : [
                <SidePanelContextChipIconWrapper>
                  <page.pageIcon
                    size={iconSizeSm}
                    color={
                      isDefined(page.pageIconColor) &&
                      page.pageIconColor !== 'currentColor'
                        ? page.pageIconColor
                        : themeCssVariables.font.color.tertiary
                    }
                  />
                </SidePanelContextChipIconWrapper>,
              ],
          text: page.pageTitle,
          onClick: isLastChip
            ? undefined
            : () => {
                navigateSidePanelHistory(originalStackIndex);
              },
        };
      })
      .filter(isDefined);
  }, [
    sidePanelNavigationStack,
    navigateSidePanelHistory,
    iconSizeSm,
    objectMetadataItems,
    recordIdentifiers,
    records,
  ]);

  return {
    contextChips,
  };
};
