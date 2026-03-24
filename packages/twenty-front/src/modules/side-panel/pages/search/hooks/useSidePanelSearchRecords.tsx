import { Command } from '@/command-menu-item/display/components/Command';
import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { t } from '@lingui/core/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { Avatar } from 'twenty-ui/display';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@apollo/client/react';
import { SearchDocument } from '~/generated/graphql';

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

  const { data: searchData, loading } = useQuery(SearchDocument, {
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

  const personRecordIds = useMemo(
    () =>
      (searchData?.search.edges.map((e) => e.node) ?? [])
        .filter((r) => r.objectNameSingular === 'person')
        .map((r) => r.recordId),
    [searchData],
  );

  const { records: personRecordsWithCompany } = useFindManyRecords({
    objectNameSingular: 'person',
    filter: personRecordIds.length > 0 ? { id: { in: personRecordIds } } : undefined,
    recordGqlFields: { id: true, company: { name: true } },
    skip: personRecordIds.length === 0,
  });

  const companyNameByPersonId = useMemo(() => {
    const map: Record<string, string> = {};
    personRecordsWithCompany.forEach((p: { id: string; company?: { name?: string } }) => {
      if (p.company?.name) map[p.id] = p.company.name;
    });
    return map;
  }, [personRecordsWithCompany]);

  const actionItems = useMemo(() => {
    return (searchData?.search.edges.map((edge) => edge.node) ?? []).map(
      (searchRecord, index) => {
        const baseAction = {
          type: CommandMenuItemType.Navigation,
          scope: CommandMenuItemScope.Global,
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
            searchRecord.objectNameSingular === 'person'
              ? (companyNameByPersonId[searchRecord.recordId] ??
                  objectMetadataItems.find((i) => i.nameSingular === 'person')?.labelSingular ??
                  'Person')
              : (objectMetadataItems.find(
                  (item) => item.nameSingular === searchRecord.objectNameSingular,
                )?.labelSingular ?? searchRecord.objectNameSingular),
        };

        if (
          [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note].includes(
            searchRecord.objectNameSingular as CoreObjectNameSingular,
          )
        ) {
          return {
            ...baseAction,
            component: (
              <Command
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
                closeSidePanelOnCommandMenuListExecution={false}
              />
            ),
          };
        }

        return {
          ...baseAction,
          component: (
            <CommandLink
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
  }, [searchData, openRecordInSidePanel, objectMetadataItems, companyNameByPersonId]);

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
