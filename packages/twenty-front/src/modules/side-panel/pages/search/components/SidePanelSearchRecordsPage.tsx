import { css } from '@linaria/core';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { SearchRecordPreviewCard } from '@/search/components/SearchRecordPreviewCard';
import { SearchResultListItem } from '@/search/components/SearchResultListItem';
import { SEARCH_RECORD_PREVIEW_WIDTH } from '@/search/constants/SearchRecordPreviewWidth';
import { useOpenSearchResultItem } from '@/search/hooks/useOpenSearchResultItem';
import { useSearchRecordPreviewItem } from '@/search/hooks/useSearchRecordPreviewItem';
import { useSearchRecords } from '@/search/hooks/useSearchRecords';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { getSidePanelSearchResultAnchorId } from '@/side-panel/pages/search/utils/getSidePanelSearchResultAnchorId';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// The card brings its own surface, so the tooltip only contributes the shadow.
// Tooltips render at 0.9 opacity, which would make the card translucent.
const previewTooltipClass = css`
  background: transparent !important;
  border-radius: ${themeCssVariables.border.radius.md} !important;
  box-shadow: ${themeCssVariables.boxShadow.strong} !important;
  opacity: 1 !important;
  padding: 0 !important;
`;

export const SidePanelSearchRecordsPage = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const sidePanelSearchObjectFilter = useAtomStateValue(
    sidePanelSearchObjectFilterState,
  );

  const { searchResultItems, loading, noResults } = useSearchRecords({
    searchInput: sidePanelSearch,
    objectNameSingular: sidePanelSearchObjectFilter,
  });

  const { closeCommandMenu } = useCloseCommandMenu();
  const { openSearchResultItem } = useOpenSearchResultItem({
    onBeforeNavigateToRecordPage: closeCommandMenu,
  });

  const selectableItemIds = useMemo(
    () => searchResultItems.map((item) => item.id),
    [searchResultItems],
  );

  const previewedItem = useSearchRecordPreviewItem(
    searchResultItems,
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const shouldDisplayPreview = !isMobile && isDefined(previewedItem);

  return (
    <>
      <SidePanelList
        selectableItemIds={selectableItemIds}
        loading={loading}
        noResults={noResults}
      >
        {searchResultItems.length > 0 && (
          <SidePanelGroup heading={t`Results`}>
            {searchResultItems.map((item) => (
              <SearchResultListItem
                key={item.id}
                item={item}
                anchorId={getSidePanelSearchResultAnchorId(item.id)}
                onClick={() => openSearchResultItem(item)}
              />
            ))}
          </SidePanelGroup>
        )}
      </SidePanelList>

      {shouldDisplayPreview && (
        <AppTooltip
          anchorSelect={`#${getSidePanelSearchResultAnchorId(previewedItem.id)}`}
          place="left-start"
          offset={16}
          noArrow
          clickable
          isOpen
          delay={TooltipDelay.noDelay}
          className={previewTooltipClass}
          width={`${SEARCH_RECORD_PREVIEW_WIDTH}px`}
        >
          <SearchRecordPreviewCard
            key={previewedItem.recordId}
            objectNameSingular={previewedItem.objectNameSingular}
            recordId={previewedItem.recordId}
            label={previewedItem.label}
          />
        </AppTooltip>
      )}
    </>
  );
};
