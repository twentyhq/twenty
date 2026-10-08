import { useDebounce } from 'use-debounce';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { useSearchableObjectNameSingulars } from '@/side-panel/hooks/useSearchableObjectNameSingulars';
import { isDefined } from 'twenty-shared/utils';

const DEFAULT_RECORD_SUGGESTION_LIMIT = 10;
const SEARCH_DEBOUNCE_DELAY = 300;

export type NavigationMenuItemSearchRecord = {
  recordId: string;
  isAlreadyInSidebar: boolean;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type UseNavigationMenuItemSearchRecordsParams = {
  searchInput: string;
  currentItems: NavigationMenuItem[];
  selectedObjectNameSingular?: string | null;
  skip?: boolean;
};

export const useNavigationMenuItemSearchRecords = ({
  searchInput,
  currentItems,
  selectedObjectNameSingular = null,
  skip = false,
}: UseNavigationMenuItemSearchRecordsParams) => {
  const trimmedSearchInput = searchInput.trim();

  const [deferredSearchInput] = useDebounce(
    trimmedSearchInput,
    SEARCH_DEBOUNCE_DELAY,
  );

  const includedObjectNameSingulars = useSearchableObjectNameSingulars({
    selectedObjectNameSingular,
  });

  const { loading: recordSearchLoading, searchRecords } =
    useObjectRecordSearchRecords({
      objectNameSingulars: includedObjectNameSingulars,
      searchInput: deferredSearchInput,
      skip: skip || includedObjectNameSingulars.length === 0,
      limit: deferredSearchInput ? undefined : DEFAULT_RECORD_SUGGESTION_LIMIT,
    });

  const isSearchDebouncing = trimmedSearchInput !== deferredSearchInput;
  const isSearchPending = !skip && (recordSearchLoading || isSearchDebouncing);
  // Avoid flashing the empty state between responses while the user is typing.
  const [settledSearchInput] = useDebounce(
    isSearchPending ? null : trimmedSearchInput,
    SEARCH_DEBOUNCE_DELAY,
  );

  const recordIdsAlreadyAdded = new Set(
    currentItems.flatMap((item) =>
      isDefined(item.targetRecordId) ? [item.targetRecordId] : [],
    ),
  );

  const navigationMenuItemSearchRecords = searchRecords.map(
    (record): NavigationMenuItemSearchRecord => ({
      recordId: record.recordId,
      isAlreadyInSidebar: recordIdsAlreadyAdded.has(record.recordId),
      objectNameSingular: record.objectNameSingular,
      label: record.label,
      imageUrl: record.imageUrl,
    }),
  );

  return {
    navigationMenuItemSearchRecords,
    deferredSearchInput,
    isSearchDebouncing,
    recordSearchLoading:
      isSearchPending || (!skip && settledSearchInput !== trimmedSearchInput),
    trimmedSearchInput,
  };
};
