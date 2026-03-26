import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SidePanelNewSidebarItemRecordItem } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemRecordItem';
import { useQuery } from '@apollo/client/react';
import { SearchDocument } from '~/generated/graphql';

type SearchRecordBase = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

export const SidePanelNewSidebarItemRecordSubPage = () => {
  const { t } = useLingui();
  const { currentDraft } = useDraftNavigationMenuItems();
  const [recordSearchInput, setRecordSearchInput] = useState('');
  const [deferredRecordSearchInput] = useDebounce(recordSearchInput, 300);
  const coreClient = useApolloCoreClient();
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const [selectedObjectNameSingular, setSelectedObjectNameSingular] = useState<
    string | null
  >(null);
  const sidePanelShowHiddenObjects = useAtomStateValue(
    sidePanelShowHiddenObjectsState,
  );

  const includedObjectNameSingulars = useMemo(() => {
    if (isDefined(selectedObjectNameSingular)) {
      return [selectedObjectNameSingular];
    }

    return readableObjectMetadataItems
      .filter((item) => sidePanelShowHiddenObjects || item.isSearchable)
      .map((item) => item.nameSingular);
  }, [
    readableObjectMetadataItems,
    selectedObjectNameSingular,
    sidePanelShowHiddenObjects,
  ]);

  const { data: searchData, loading: recordSearchLoading } = useQuery(
    SearchDocument,
    {
      client: coreClient,
      variables: {
        searchInput: deferredRecordSearchInput ?? '',
        limit: MAX_SEARCH_RESULTS,
        includedObjectNameSingulars,
      },
    },
  );

  const workspaceRecordIds = new Set(
    currentDraft.flatMap((item) =>
      isDefined(item.targetRecordId) ? [item.targetRecordId] : [],
    ),
  );

  const searchRecords =
    searchData?.search?.edges?.map((edge) => edge.node) ?? [];
  const availableSearchRecords = searchRecords.filter(
    (record) => !workspaceRecordIds.has(record.recordId),
  ) as SearchRecordBase[];

  const isEmpty = availableSearchRecords.length === 0 && !recordSearchLoading;
  const selectableItemIds = isEmpty
    ? []
    : availableSearchRecords.map((record) => record.recordId);
  const noResultsText =
    deferredRecordSearchInput.length > 0
      ? t`No results found`
      : t`Type to search records`;

  return (
    <SidePanelSubViewWithSearch
      searchPlaceholder={t`Search records...`}
      searchValue={recordSearchInput}
      onSearchChange={setRecordSearchInput}
      rightElement={
        <SidePanelObjectFilterDropdown
          selectedObjectNameSingular={selectedObjectNameSingular}
          onSelectObject={setSelectedObjectNameSingular}
        />
      }
    >
      <SidePanelAddToNavigationDroppable>
        {({ innerRef, droppableProps, placeholder }) => (
          <SidePanelList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
            loading={recordSearchLoading}
            noResults={isEmpty}
            noResultsText={noResultsText}
          >
            {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
            <div ref={innerRef} {...droppableProps}>
              <SidePanelGroup heading={t`Results`}>
                {availableSearchRecords.map((record, index) => (
                  <SidePanelNewSidebarItemRecordItem
                    key={record.recordId}
                    record={record}
                    dragIndex={index}
                  />
                ))}
              </SidePanelGroup>
              {placeholder}
            </div>
          </SidePanelList>
        )}
      </SidePanelAddToNavigationDroppable>
    </SidePanelSubViewWithSearch>
  );
};
