import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { SidePanelNewSidebarItemRecordItem } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemRecordItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSearchQuery } from '~/generated/graphql';

type SearchRecordBase = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type SidePanelNewSidebarItemRecordSubViewProps = {
  onBack: () => void;
  disableDrag?: boolean;
};

export const SidePanelNewSidebarItemRecordSubView = ({
  onBack,
  disableDrag: disableDragProp,
}: SidePanelNewSidebarItemRecordSubViewProps) => {
  const { t } = useLingui();
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const disableDrag =
    disableDragProp ?? addMenuItemInsertionContext?.disableDrag === true;
  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const [recordSearchInput, setRecordSearchInput] = useState('');
  const [deferredRecordSearchInput] = useDebounce(recordSearchInput, 300);
  const coreClient = useApolloCoreClient();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const nonReadableObjectMetadataItemsNameSingular = objectMetadataItems
    .filter(
      (objectMetadataItem) =>
        !getObjectPermissionsFromMapByObjectMetadataId({
          objectPermissionsByObjectMetadataId,
          objectMetadataId: objectMetadataItem.id,
        })?.canReadObjectRecords,
    )
    .map((objectMetadataItem) => objectMetadataItem.nameSingular);

  const { data: searchData, loading: recordSearchLoading } = useSearchQuery({
    client: coreClient,
    variables: {
      searchInput: deferredRecordSearchInput ?? '',
      limit: MAX_SEARCH_RESULTS,
      excludedObjectNameSingulars: [
        'workspaceMember',
        ...nonReadableObjectMetadataItemsNameSingular,
      ],
    },
  });

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
      backBarTitle={t`Add a record`}
      onBack={onBack}
      searchPlaceholder={t`Search records...`}
      searchValue={recordSearchInput}
      onSearchChange={setRecordSearchInput}
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
                    dragIndex={disableDrag ? undefined : index}
                    disableDrag={disableDrag}
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
