import { Command } from '@/command-menu-item/display/components/Command';
import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { sidePanelSearchContextObjectNameSingularState } from '@/side-panel/states/sidePanelSearchContextObjectNameSingularState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@apollo/client/react';
import { SearchDocument } from '~/generated/graphql';

export const useSidePanelSearchRecords = () => {
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const sidePanelSearchObjectFilter = useAtomStateValue(
    sidePanelSearchObjectFilterState,
  );
  const sidePanelShowHiddenObjects = useAtomStateValue(
    sidePanelShowHiddenObjectsState,
  );
  const contextObjectNameSingular = useAtomStateValue(
    sidePanelSearchContextObjectNameSingularState,
  );
  const coreClient = useApolloCoreClient();

  const [deferredSidePanelSearch] = useDebounce(sidePanelSearch, 300);
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();

  const includedObjectNameSingulars = useMemo(() => {
    if (isDefined(sidePanelSearchObjectFilter)) {
      return [sidePanelSearchObjectFilter];
    }

    return readableObjectMetadataItems
      .filter((item) => sidePanelShowHiddenObjects || item.isSearchable)
      .map((item) => item.nameSingular);
  }, [
    readableObjectMetadataItems,
    sidePanelSearchObjectFilter,
    sidePanelShowHiddenObjects,
  ]);

  const { data: searchData, loading } = useQuery(SearchDocument, {
    client: coreClient,
    variables: {
      searchInput: deferredSidePanelSearch ?? '',
      limit: MAX_SEARCH_RESULTS,
      includedObjectNameSingulars,
    },
  });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const sortedEdges = useMemo(() => {
    const edges = searchData?.search.edges ?? [];
    if (!contextObjectNameSingular) return edges;
    return [
      ...edges.filter(
        (e) => e.node.objectNameSingular === contextObjectNameSingular,
      ),
      ...edges.filter(
        (e) => e.node.objectNameSingular !== contextObjectNameSingular,
      ),
    ];
  }, [searchData, contextObjectNameSingular]);

  const personRecordIds = useMemo(
    () =>
      sortedEdges
        .map((e) => e.node)
        .filter((r) => r.objectNameSingular === 'person')
        .map((r) => r.recordId),
    [sortedEdges],
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
    return sortedEdges.map((edge) => edge.node).map(
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
                  readableObjectMetadataItems.find((i) => i.nameSingular === 'person')?.labelSingular ??
                  'Person')
              : (readableObjectMetadataItems.find(
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
                  searchRecord.objectNameSingular ===
                  CoreObjectNameSingular.Task
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
  }, [sortedEdges, openRecordInSidePanel, readableObjectMetadataItems, companyNameByPersonId]);

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
