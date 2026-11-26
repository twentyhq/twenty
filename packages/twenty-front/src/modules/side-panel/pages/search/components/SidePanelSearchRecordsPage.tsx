import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSearchRecordObjectSection } from '@/side-panel/pages/search/components/SidePanelSearchRecordObjectSection';
import { SidePanelSearchRecordPreviewCard } from '@/side-panel/pages/search/components/SidePanelSearchRecordPreviewCard';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewWidth';
import { useSidePanelSearchRecordPreviewItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewItem';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { type SearchResultItemGroup } from '@/side-panel/pages/search/types/SearchResultItemGroup';
import { useIsMobile } from 'twenty-ui/utilities';
import { css } from '@linaria/core';
import groupBy from 'lodash.groupby';
import { useMemo, useRef } from 'react';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

// The card brings its own surface, so the tooltip only contributes the shadow.
const previewTooltipClass = css`
  background: transparent;
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  padding: 0;
`;

export const SidePanelSearchRecordsPage = () => {
  const { searchResultItems, loading, noResults, error } =
    useSidePanelSearchRecords();
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const isMobile = useIsMobile();

  const searchResultItemGroups: SearchResultItemGroup[] = useMemo(
    () =>
      Object.entries(
        groupBy(searchResultItems, (item) => item.objectNameSingular),
      ).map(([objectNameSingular, objectSearchResultItems]) => {
        const objectMetadataItem = readableObjectMetadataItems.find(
          (item) => item.nameSingular === objectNameSingular,
        );

        return {
          objectNameSingular,
          objectLabelPlural:
            objectMetadataItem?.labelPlural ?? objectNameSingular,
          objectMetadataItem,
          searchResultItems: objectSearchResultItems,
        };
      }),
    [searchResultItems, readableObjectMetadataItems],
  );

  const selectableItemIds = useMemo(
    () =>
      searchResultItemGroups.flatMap((searchResultItemGroup) =>
        searchResultItemGroup.searchResultItems.map((item) => item.id),
      ),
    [searchResultItemGroups],
  );

  const previewAnchorRef = useRef<HTMLDivElement>(null);

  const previewedItem = useSidePanelSearchRecordPreviewItem(searchResultItems);

  const shouldDisplayPreview = !isMobile && isDefined(previewedItem);

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />

      <SidePanelList
        selectableItemIds={selectableItemIds}
        loading={loading}
        noResults={noResults}
      >
        {searchResultItemGroups.map((searchResultItemGroup) => (
          <SidePanelSearchRecordObjectSection
            key={searchResultItemGroup.objectNameSingular}
            searchResultItemGroup={searchResultItemGroup}
            previewedItemId={previewedItem?.id}
            previewAnchorRef={previewAnchorRef}
          />
        ))}
      </SidePanelList>

      {shouldDisplayPreview && (
        <Tooltip.Root key={previewedItem.id} open>
          <Tooltip.Portal>
            <Tooltip.Positioner
              anchor={previewAnchorRef}
              side="left"
              align="start"
              sideOffset={16}
            >
              <Tooltip.Popup
                maxWidth={SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH}
                className={previewTooltipClass}
              >
                <SidePanelSearchRecordPreviewCard
                  key={previewedItem.recordId}
                  objectNameSingular={previewedItem.objectNameSingular}
                  recordId={previewedItem.recordId}
                  label={previewedItem.label}
                />
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      )}
    </>
  );
};
