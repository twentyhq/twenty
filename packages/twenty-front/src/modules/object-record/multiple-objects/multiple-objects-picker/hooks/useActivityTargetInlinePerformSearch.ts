import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray } from '@/object-record/multiple-objects/multiple-objects-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { useMultiObjectSearch } from '@/object-record/multiple-objects/multiple-objects-picker/hooks/useMultiObjectSearch';
import { objectRecordMultiSelectMatchesFilterRecordsIdsComponentState } from '@/object-record/multiple-objects/multiple-objects-picker/states/objectRecordMultiSelectMatchesFilterRecordsIdsComponentState';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

export const useActivityTargetInlinePerformSearch = (
  componentInstanceIdFromProps: string,
) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
    componentInstanceIdFromProps,
  );
  const setRecordMultiSelectMatchesFilterRecords = useSetRecoilState(
    objectRecordMultiSelectMatchesFilterRecordsIdsComponentState({
      scopeId: instanceId,
    }),
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
