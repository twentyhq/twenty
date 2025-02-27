import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray';
import { useMultipleRecordPickerSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useRecoilCallback } from 'recoil';

export const useMultipleRecordPickerPerformSearch = (
  componentInstanceIdFromProps: string,
) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
    componentInstanceIdFromProps,
  );
  const setRecordMultiSelectMatchesFilterRecords = useSetRecoilComponentStateV2(
    multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState,
    instanceId,
  );

  const recordPickerSearchFilter = useRecoilComponentValueV2(
    multipleRecordPickerSearchFilterComponentState,
    instanceId,
  );

  const { matchesSearchFilterObjectRecordsQueryResult } =
    useMultipleRecordPickerSearch({
      excludedObjects: [
        CoreObjectNameSingular.Task,
        CoreObjectNameSingular.Note,
      ],
      searchFilterValue: recordPickerSearchFilter,
      limit: 10,
    });

  const { objectRecordForSelectArray } =
    useMultipleRecordPickerQueryResultFormattedAsObjectRecordForSelectArray({
      multiObjectRecordsQueryResult:
        matchesSearchFilterObjectRecordsQueryResult,
    });

  const performSearch = useRecoilCallback(
    ({ set }) => {
      return (_searchFilter: string) => {
        setRecordMultiSelectMatchesFilterRecords(objectRecordForSelectArray);
      };
    },
    [objectRecordForSelectArray, setRecordMultiSelectMatchesFilterRecords],
  );

  return { performSearch };
};
