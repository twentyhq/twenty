import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSearchRecords } from '@/side-panel/pages/search/hooks/useSidePanelSearchRecords';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { useLingui } from '@lingui/react/macro';

export const SidePanelSearchRecordsPage = () => {
  const { t } = useLingui();
  const { searchResultItems, loading, noResults } = useSidePanelSearchRecords();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { closeCommandMenu } = useCloseCommandMenu();
  const navigate = useNavigate();

  const selectableItemIds = useMemo(
    () => searchResultItems.map((item) => item.id),
    [searchResultItems],
  );

  return (
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
                      avatarUrl={item.imageUrl}
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
  );
};
