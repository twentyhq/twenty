import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { MultipleObjectsPickerComponentInstanceContext } from '@/object-record/multiple-objects/multiple-objects-picker/states/contexts/MultipleObjectsPickerComponentInstanceContext';
import { multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState } from '@/object-record/multiple-objects/multiple-objects-picker/states/multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useRecoilCallback } from 'recoil';

export const useMultipleObjectsPickerPerformSearch = (
  componentInstanceIdFromProps: string,
) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleObjectsPickerComponentInstanceContext,
    componentInstanceIdFromProps,
  );
  const setRecordMultiSelectMatchesFilterRecords = useSetRecoilComponentStateV2(
    multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState,
    instanceId,
  );

  const recordPickerSearchFilter = useRecoilComponentValueV2(
    recordPickerSearchFilterComponentState,
    instanceId,
  );

  const { matchesSearchFilterObjectRecordsQueryResult } = useMultiObjectSearch({
    excludedObjects: [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note],
    searchFilterValue: recordPickerSearchFilter,
    limit: 10,
  });

  const { objectRecordForSelectArray } =
    useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray({
      multiObjectRecordsQueryResult:
        matchesSearchFilterObjectRecordsQueryResult,
    });

  const performSearch = useRecoilCallback(
    ({ set }) => {
      return (searchFilter: string) => {
        setRecordMultiSelectMatchesFilterRecords(objectRecordForSelectArray);
      };
    },
    [objectRecordForSelectArray, setRecordMultiSelectMatchesFilterRecords],
  );

  return { performSearch };
};
