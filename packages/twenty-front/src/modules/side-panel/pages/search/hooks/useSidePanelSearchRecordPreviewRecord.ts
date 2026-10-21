import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SEARCH_RECORD_PREVIEW_DEBOUNCE_MS } from '@/side-panel/pages/search/constants/SearchRecordPreviewDebounceMs';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebounce } from 'use-debounce';

// Field displays read from the record store, so hydrate it; debounced to skip rows crossed with arrow keys
export const useSidePanelSearchRecordPreviewRecord = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}) => {
  const store = useStore();

  const [debouncedRecordId] = useDebounce(
    recordId,
    SEARCH_RECORD_PREVIEW_DEBOUNCE_MS,
  );

  // objectNameSingular tracks the selection, so it matches the debounced record only once settled
  const isDebouncedRecordIdSettled = debouncedRecordId === recordId;

  const { record } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
    skip: !isDebouncedRecordIdSettled,
  });

  useEffect(() => {
    if (!isDefined(record)) {
      return;
    }

    store.set(
      recordStoreFamilyState.atomFamily(recordId),
      record as ObjectRecord,
    );
  }, [record, recordId, store]);

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  return { isRecordLoaded: isDefined(recordStore) };
};
