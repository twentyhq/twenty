import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { objectRecordMultiSelectMatchesFilterRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectMatchesFilterRecordsIdsComponentState';
import { useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/relation-picker/states/recordPickerSearchFilterComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const ActivityTargetInlineCellEditModeMultiRecordsSearchFilterEffect =
  () => {
    const instanceId = useAvailableComponentInstanceIdOrThrow(
      RecordPickerComponentInstanceContext,
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

    const { matchesSearchFilterObjectRecordsQueryResult } =
      useMultiObjectSearch({
        excludedObjects: [
          CoreObjectNameSingular.Task,
          CoreObjectNameSingular.Note,
        ],
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
