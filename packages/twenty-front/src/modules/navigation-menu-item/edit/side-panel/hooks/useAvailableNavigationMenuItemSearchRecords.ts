import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@apollo/client/react';

import { MAX_SEARCH_RESULTS } from '@/command-menu/constants/MaxSearchResults';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SearchDocument } from '~/generated/graphql';

export type NavigationMenuItemSearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type UseAvailableNavigationMenuItemSearchRecordsParams = {
  searchInput: string;
  selectedObjectNameSingular?: string | null;
  skip?: boolean;
};

export const useAvailableNavigationMenuItemSearchRecords = ({
  searchInput,
  selectedObjectNameSingular = null,
  skip = false,
}: UseAvailableNavigationMenuItemSearchRecordsParams) => {
  const { currentItems } = useNavigationMenuItemEditController();
  const coreClient = useApolloCoreClient();
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const sidePanelShowHiddenObjects = useAtomStateValue(
    sidePanelShowHiddenObjectsState,
  );

  const [deferredSearchInput] = useDebounce(searchInput, 300);

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
        searchInput: deferredSearchInput,
        limit: MAX_SEARCH_RESULTS,
        includedObjectNameSingulars,
      },
      skip,
    },
  );

  const recordIdsAlreadyAdded = useMemo(
    () =>
      new Set(
        currentItems.flatMap((item) =>
          isDefined(item.targetRecordId) ? [item.targetRecordId] : [],
        ),
      ),
    [currentItems],
  );

  const availableSearchRecords = useMemo(
    () =>
      (searchData?.search?.edges?.map((edge) => edge.node) ?? [])
        .filter((record) => !recordIdsAlreadyAdded.has(record.recordId))
        .map(
          (record): NavigationMenuItemSearchRecord => ({
            recordId: record.recordId,
            objectNameSingular: record.objectNameSingular,
            label: record.label,
            imageUrl: record.imageUrl,
          }),
        ),
    [recordIdsAlreadyAdded, searchData],
  );

  return {
    availableSearchRecords,
    deferredSearchInput,
    recordSearchLoading,
  };
};
