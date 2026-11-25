import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSearchRecordItem } from '@/side-panel/pages/search/components/SidePanelSearchRecordItem';
import { SidePanelSearchRecordPreviewCard } from '@/side-panel/pages/search/components/SidePanelSearchRecordPreviewCard';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewWidth';
import { useSidePanelSearchRecordPreviewItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewItem';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { useIsMobile } from 'twenty-ui/utilities';
import { css } from '@linaria/core';
import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
  const { searchResultItems, loading, noResults, error } =
    useSidePanelSearchRecords();
  const isMobile = useIsMobile();

  const selectableItemIds = useMemo(
    () => searchResultItems.map((item) => item.id),
    [searchResultItems],
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
        {searchResultItems.length > 0 && (
          <SidePanelGroup heading={t`Results`}>
            {searchResultItems.map((item) => (
              <SidePanelSearchRecordItem
                key={item.id}
                item={item}
                anchorRef={
                  previewedItem?.id === item.id ? previewAnchorRef : undefined
                }
              />
            ))}
          </SidePanelGroup>
        )}
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
