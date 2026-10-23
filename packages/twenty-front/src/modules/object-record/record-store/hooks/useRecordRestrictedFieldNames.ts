import { recordStoreRestrictedFieldNamesFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreRestrictedFieldNamesFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useRecordRestrictedFieldNames = (recordId: string) =>
  useAtomFamilySelectorValue(
    recordStoreRestrictedFieldNamesFamilySelector,
    recordId,
  );
