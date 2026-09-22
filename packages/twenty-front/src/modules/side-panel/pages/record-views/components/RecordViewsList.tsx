import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordPickerLoadingSkeletonList } from '@/object-record/record-picker/components/RecordPickerLoadingSkeletonList';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useRecordViews } from '@/side-panel/pages/record-views/hooks/useRecordViews';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { t } from '@lingui/core/macro';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconRefresh, useIcons } from 'twenty-ui/icon';

const RETRY_ITEM_ID = 'retry-record-views';

type RecordViewsListProps = {
  objectNameSingular: string;
};

export const RecordViewsList = ({
  objectNameSingular,
}: RecordViewsListProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { views, loading, error, hasReadPermission, retry } = useRecordViews();
  const { getIcon } = useIcons();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const navigate = useNavigate();

  const openView = (viewId: string) => {
    void closeSidePanelMenu();
    navigate(
      getAppPath(
        AppPath.RecordIndexPage,
        {
          objectNamePlural: objectMetadataItem.namePlural,
        },
        { viewId },
      ),
    );
  };

  return (
    <SidePanelList
      selectableItemIds={error ? [RETRY_ITEM_ID] : views.map((view) => view.id)}
      loading={loading}
      noResults={!error && views.length === 0}
      noResultsText={
        hasReadPermission
          ? t`No views contain this record`
          : t`You cannot read these records`
      }
    >
      {loading && <RecordPickerLoadingSkeletonList />}
      {error && (
        <SidePanelGroup heading={t`Unable to load views`}>
          <SelectableListItem itemId={RETRY_ITEM_ID} onEnter={retry}>
            <CommandMenuItem
              id={RETRY_ITEM_ID}
              label={t`Try again`}
              Icon={IconRefresh}
              onClick={retry}
            />
          </SelectableListItem>
        </SidePanelGroup>
      )}
      {views.length > 0 && (
        <SidePanelGroup heading={t`Views containing this record`}>
          {views.map((view) => (
            <SelectableListItem
              key={view.id}
              itemId={view.id}
              onEnter={() => openView(view.id)}
            >
              <CommandMenuItem
                id={view.id}
                label={view.name}
                Icon={getIcon(view.icon)}
                onClick={() => openView(view.id)}
              />
            </SelectableListItem>
          ))}
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
