import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { SidePanelSearchRecordPreviewCard } from '@/side-panel/pages/search/components/SidePanelSearchRecordPreviewCard';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewWidth';
import { useSidePanelSearchRecordPreviewItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewItem';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useIsMobile } from 'twenty-ui/utilities';
import { css } from '@linaria/core';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

// The card brings its own surface, so the tooltip only contributes the shadow.
const previewTooltipClass = css`
  background: transparent !important;
  border-radius: ${themeCssVariables.border.radius.md} !important;
  box-shadow: ${themeCssVariables.boxShadow.strong} !important;
  padding: 0 !important;
`;

export const SidePanelSearchRecordsPage = () => {
  const { t } = useLingui();
  const { searchResultItems, loading, noResults, error } =
    useSidePanelSearchRecords();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { closeCommandMenu } = useCloseCommandMenu();
  const navigate = useNavigate();
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
            {searchResultItems.map((item) => {
              const isTaskOrNote = [
                CoreObjectNameSingular.Task,
                CoreObjectNameSingular.Note,
              ].includes(item.objectNameSingular as CoreObjectNameSingular);

              const handleClick = () => {
                if (isTaskOrNote) {
                  openRecordInSidePanel({
                    recordId: item.recordId,
                    objectNameSingular:
                      item.objectNameSingular as CoreObjectNameSingular,
                  });
                } else {
                  closeCommandMenu();
                  navigate(
                    getAppPath(AppPath.RecordShowPage, {
                      objectNameSingular: item.objectNameSingular,
                      objectRecordId: item.recordId,
                    }),
                  );
                }
              };

              return (
                <SelectableListItem
                  key={item.id}
                  itemId={item.id}
                  onEnter={handleClick}
                >
                  <div
                    ref={
                      previewedItem?.id === item.id
                        ? previewAnchorRef
                        : undefined
                    }
                  >
                    <CommandMenuItem
                      id={item.id}
                      label={item.label}
                      description={item.objectLabel}
                      onClick={handleClick}
                      LeftComponent={
                        <Avatar
                          shape={item.avatarShape}
                          src={getAbsoluteImageUrl(item.imageUrl)}
                          colorSeed={item.recordId}
                          name={item.label}
                        />
                      }
                    />
                  </div>
                </SelectableListItem>
              );
            })}
          </SidePanelGroup>
        )}
      </SidePanelList>

      {shouldDisplayPreview && (
        <Tooltip.Root key={previewedItem.id} open>
          <Tooltip.Popup
            anchor={previewAnchorRef}
            side="left"
            align="start"
            sideOffset={16}
            className={previewTooltipClass}
            maxWidth={`${SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH}px`}
          >
            <SidePanelSearchRecordPreviewCard
              key={previewedItem.recordId}
              objectNameSingular={previewedItem.objectNameSingular}
              recordId={previewedItem.recordId}
              label={previewedItem.label}
            />
          </Tooltip.Popup>
        </Tooltip.Root>
      )}
    </>
  );
};
