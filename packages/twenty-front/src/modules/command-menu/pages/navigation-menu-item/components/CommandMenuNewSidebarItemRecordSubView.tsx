import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuAddToNavDroppable } from '@/command-menu/components/CommandMenuAddToNavDroppable';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { CommandMenuNewSidebarItemRecordItem } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemRecordItem';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useSearchQuery } from '~/generated/graphql';

type SearchRecordBase = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type CommandMenuNewSidebarItemRecordSubViewProps = {
  onBack: () => void;
};

export const CommandMenuNewSidebarItemRecordSubView = ({
  onBack,
}: CommandMenuNewSidebarItemRecordSubViewProps) => {
  const { t } = useLingui();
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
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Add a record`}
      onBack={onBack}
      searchPlaceholder={t`Search records...`}
      searchValue={recordSearchInput}
      onSearchChange={setRecordSearchInput}
    >
      <CommandMenuAddToNavDroppable>
        {({ innerRef, droppableProps, placeholder }) => (
          <CommandMenuList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
            loading={recordSearchLoading}
            noResults={isEmpty}
            noResultsText={noResultsText}
          >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div ref={innerRef} {...droppableProps}>
              <CommandGroup heading={t`Results`}>
                {availableSearchRecords.map((record, index) => (
                  <CommandMenuNewSidebarItemRecordItem
                    key={record.recordId}
                    record={record}
                    dragIndex={index}
                  />
                ))}
              </CommandGroup>
              {placeholder}
            </div>
          </CommandMenuList>
        )}
      </CommandMenuAddToNavDroppable>
    </CommandMenuSubViewWithSearch>
  );
};
