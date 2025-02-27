import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray } from '@/activities/inline-cell/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { useMultiObjectSearch } from '@/activities/inline-cell/hooks/useMultiObjectSearch';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { objectRecordMultiSelectMatchesFilterRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectMatchesFilterRecordsIdsComponentState';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

// Todo: this effect should be deprecated to use sync hooks
export const ActivityTargetInlineCellEditModeMultiRecordsSearchFilterEffect = ({
  recordPickerInstanceId,
}: {
  recordPickerInstanceId: string;
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
    recordPickerInstanceId,
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

  useEffect(() => {
    setRecordMultiSelectMatchesFilterRecords(objectRecordForSelectArray);
  }, [setRecordMultiSelectMatchesFilterRecords, objectRecordForSelectArray]);

  return <></>;
};
