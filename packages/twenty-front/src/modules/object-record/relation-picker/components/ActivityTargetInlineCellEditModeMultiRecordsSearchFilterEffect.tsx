import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { objectRecordMultiSelectMatchesFilterRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectMatchesFilterRecordsIdsComponentState';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const ActivityTargetInlineCellEditModeMultiRecordsSearchFilterEffect =
  () => {
    const scopeId = useAvailableScopeIdOrThrow(
      RelationPickerScopeInternalContext,
    );

    const setRecordMultiSelectMatchesFilterRecords = useSetRecoilState(
      objectRecordMultiSelectMatchesFilterRecordsIdsComponentState({
        scopeId,
      }),
    );

    const relationPickerScopedId = useAvailableScopeIdOrThrow(
      RelationPickerScopeInternalContext,
    );

    const { relationPickerSearchFilterState } = useRelationPickerScopedStates({
      relationPickerScopedId,
    });
    const relationPickerSearchFilter = useRecoilValue(
      relationPickerSearchFilterState,
    );

    const { matchesSearchFilterObjectRecordsQueryResult } =
      useMultiObjectSearch({
        excludedObjects: [
          CoreObjectNameSingular.Task,
          CoreObjectNameSingular.Note,
        ],
        searchFilterValue: relationPickerSearchFilter,
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
