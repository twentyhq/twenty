import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSearchAiAnswerCard } from '@/side-panel/pages/search/components/SidePanelSearchAiAnswerCard';
import { SidePanelSearchRecordPreviewCard } from '@/side-panel/pages/search/components/SidePanelSearchRecordPreviewCard';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_WIDTH } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewWidth';
import { useOpenSidePanelSearchRecord } from '@/side-panel/pages/search/hooks/useOpenSidePanelSearchRecord';
import { useSidePanelSearchAiAnswer } from '@/side-panel/pages/search/hooks/useSidePanelSearchAiAnswer';
import { useSidePanelSearchRecordPreviewItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewItem';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useIsMobile } from 'twenty-ui/utilities';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

// The card brings its own surface, so the tooltip only contributes the shadow.
const previewTooltipClass = css`
  background: transparent;
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  padding: 0;
`;

const StyledAiAnswerContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[1]};
`;

export const SidePanelSearchRecordsPage = () => {
  const { t } = useLingui();
  const {
    searchResultItems,
    loading,
    noResults,
    error,
    areSearchResultsCurrent,
    trimmedSidePanelSearch,
    sidePanelSearchObjectFilter,
  } = useSidePanelSearchRecords();
  const { openSidePanelSearchRecord } = useOpenSidePanelSearchRecord();
  const { answerState, requestQuickAnswer, searchSessionId } =
    useSidePanelSearchAiAnswer({
      question: trimmedSidePanelSearch,
      objectFilter: sidePanelSearchObjectFilter,
      searchResultItems,
      areSearchResultsCurrent,
    });
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
        {answerState.status !== 'idle' && (
          <StyledAiAnswerContainer>
            <SidePanelSearchAiAnswerCard
              question={trimmedSidePanelSearch}
              answerState={answerState}
              searchSessionId={searchSessionId}
              onRequestQuickAnswer={requestQuickAnswer}
            />
          </StyledAiAnswerContainer>
        )}
        {searchResultItems.length > 0 && (
          <SidePanelGroup heading={t`Results`}>
            {searchResultItems.map((item) => {
              const handleClick = () => openSidePanelSearchRecord(item);

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
