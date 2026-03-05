import { Action } from '@/action-menu/actions/components/Action';
import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { t } from '@lingui/core/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { Avatar } from 'twenty-ui/display';
import { useDebounce } from 'use-debounce';
import { useSearchQuery } from '~/generated/graphql';

export const useSidePanelSearchRecords = () => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const coreClient = useApolloCoreClient();

  const [deferredSidePanelSearch] = useDebounce(sidePanelSearch, 300);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItems } = useObjectMetadataItems();

  const nonReadableObjectMetadataItemsNameSingular = useMemo(() => {
    return Object.values(objectMetadataItems)
      .filter((objectMetadataItem) => {
        const objectPermission = getObjectPermissionsFromMapByObjectMetadataId({
          objectPermissionsByObjectMetadataId,
          objectMetadataId: objectMetadataItem.id,
        });

        return !objectPermission?.canReadObjectRecords;
      })
      .map((objectMetadataItem) => objectMetadataItem.nameSingular);
  }, [objectMetadataItems, objectPermissionsByObjectMetadataId]);

  const { data: searchData, loading } = useSearchQuery({
    client: coreClient,
    variables: {
      searchInput: deferredSidePanelSearch ?? '',
      limit: MAX_SEARCH_RESULTS,
      excludedObjectNameSingulars: [
        'workspaceMember',
        ...nonReadableObjectMetadataItemsNameSingular,
      ],
    },
  });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const actionItems = useMemo(() => {
    return (searchData?.search.edges.map((edge) => edge.node) ?? []).map(
      (searchRecord, index) => {
        const baseAction = {
          type: ActionType.Navigation,
          scope: ActionScope.Global,
          key: searchRecord.recordId,
          label: searchRecord.label,
          position: index,
          Icon: () => (
            <Avatar
              type={
                searchRecord.objectNameSingular ===
                CoreObjectNameSingular.Company
                  ? 'squared'
                  : 'rounded'
              }
              avatarUrl={searchRecord.imageUrl}
              placeholderColorSeed={searchRecord.recordId}
              placeholder={searchRecord.label}
            />
          ),
          shouldBeRegistered: () => true,
          description:
            objectMetadataItems.find(
              (item) => item.nameSingular === searchRecord.objectNameSingular,
            )?.labelSingular ?? searchRecord.objectNameSingular,
        };

        if (
          [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note].includes(
            searchRecord.objectNameSingular as CoreObjectNameSingular,
          )
        ) {
          return {
            ...baseAction,
            component: (
              <Action
                onClick={() => {
                  searchRecord.objectNameSingular === 'task'
                    ? openRecordInSidePanel({
                        recordId: searchRecord.recordId,
                        objectNameSingular: CoreObjectNameSingular.Task,
                      })
                    : openRecordInSidePanel({
                        recordId: searchRecord.recordId,
                        objectNameSingular: CoreObjectNameSingular.Note,
                      });
                }}
                closeSidePanelOnCommandMenuListActionExecution={false}
              />
            ),
          };
        }

        return {
          ...baseAction,
          component: (
            <ActionLink
              to={AppPath.RecordShowPage}
              params={{
                objectNameSingular: searchRecord.objectNameSingular,
                objectRecordId: searchRecord.recordId,
              }}
            />
          ),
        };
      },
    );
  }, [searchData, openRecordInSidePanel, objectMetadataItems]);

  return {
    loading,
    noResults: !actionItems?.length,
    commandGroups: [
      {
        heading: t`Results`,
        items: actionItems,
      },
    ],
    hasMore: false,
    pageSize: 0,
    onLoadMore: () => {},
  };
};
