import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { SidePanelSearchRecordPreview } from '@/side-panel/pages/search/components/SidePanelSearchRecordPreview';
import { useSidePanelSearchRecordPreviewItem } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecordPreviewItem';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledSearchRecordsPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledResultsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledPreviewContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 50%;
  min-height: 0;
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
    <StyledSearchRecordsPage>
      <StyledResultsContainer>
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
                  </SelectableListItem>
                );
              })}
            </SidePanelGroup>
          )}
        </SidePanelList>
      </StyledResultsContainer>

      {shouldDisplayPreview && (
        <StyledPreviewContainer>
          <SidePanelSearchRecordPreview
            key={previewedItem.recordId}
            objectNameSingular={previewedItem.objectNameSingular}
            recordId={previewedItem.recordId}
          />
        </StyledPreviewContainer>
      )}
    </StyledSearchRecordsPage>
  );
};
