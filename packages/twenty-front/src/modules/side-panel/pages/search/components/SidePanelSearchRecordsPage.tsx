import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { SidePanelSearchRecordPreviewCard } from '@/side-panel/pages/search/components/SidePanelSearchRecordPreviewCard';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewWidth';
import { useSidePanelSearchRecordPreviewItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewItem';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { getSidePanelSearchResultAnchorId } from '@/side-panel/pages/search/utils/getSidePanelSearchResultAnchorId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { css } from '@linaria/core';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

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
  const { searchResultItems, loading, noResults } = useSidePanelSearchRecords();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { closeCommandMenu } = useCloseCommandMenu();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const selectableItemIds = useMemo(
    () => searchResultItems.map((item) => item.id),
    [searchResultItems],
  );

  const previewedItem = useSidePanelSearchRecordPreviewItem(searchResultItems);

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
                  <div id={getSidePanelSearchResultAnchorId(item.id)}>
                    <CommandMenuItem
                      id={item.id}
                      label={item.label}
                      description={item.objectLabel}
                      onClick={handleClick}
                      LeftComponent={
                        <Avatar
                          type={item.avatarType}
                          avatarUrl={getAbsoluteImageUrl(item.imageUrl)}
                          placeholderColorSeed={item.recordId}
                          placeholder={item.label}
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
        <AppTooltip
          anchorSelect={`#${getSidePanelSearchResultAnchorId(previewedItem.id)}`}
          place="left-start"
          offset={16}
          noArrow
          clickable
          isOpen
          delay={TooltipDelay.noDelay}
          className={previewTooltipClass}
          width={`${SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH}px`}
        >
          {/* Keyed so the card's own state resets with the record, while the
              tooltip around it stays mounted and keeps its position */}
          <SidePanelSearchRecordPreviewCard
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
