import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { objectRecordMultiSelectMatchesFilterRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectMatchesFilterRecordsIdsComponentState';
import { useRelationPickerScopedStates } from '@/object-record/relation-picker/hooks/internal/useRelationPickerScopedStates';
import { useMultiObjectSearchMatchesSearchFilterQuery } from '@/object-record/relation-picker/hooks/useMultiObjectSearchMatchesSearchFilterQuery';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const ActivityTargetInlineCellEditModeMultiRecords2Effect = () => {
  console.log('rendering ActivityTargetInlineCellEditModeMultiRecords2Effect');
  const scopeId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
  );
  const { recordMultiSelectIsLoadingState } =
    useObjectRecordMultiSelectScopedStates(scopeId);
  //   const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
  //     useRecoilState(objectRecordsIdsMultiSelectState);

  const setRecordMultiSelectIsLoading = useSetRecoilState(
    recordMultiSelectIsLoadingState,
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

  const {
    matchesSearchFilterObjectRecords,
    matchesSearchFilterObjectRecordsLoading: loading,
  } = useMultiObjectSearchMatchesSearchFilterQuery({
    excludedObjects: [CoreObjectNameSingular.Task, CoreObjectNameSingular.Note],
    searchFilterValue: relationPickerSearchFilter,
    limit: 10,
  });

  setRecordMultiSelectMatchesFilterRecords(matchesSearchFilterObjectRecords);

  //   const [
  //     objectRecordMultiSelectCheckedRecordsIds,
  //     setObjectRecordMultiSelectCheckedRecordsIds,
  //   ] = useRecoilState(objectRecordMultiSelectCheckedRecordsIdsState);

  //   const updateRecords = useRecoilCallback(
  //     ({ snapshot, set }) =>
  //       (newRecords: ObjectRecordForSelect[]) => {
  //         for (const newRecord of newRecords) {
  //           const currentRecord = snapshot
  //             .getLoadable(
  //               objectRecordMultiSelectComponentFamilyState({
  //                 scopeId: scopeId,
  //                 familyKey: newRecord.record.id,
  //               }),
  //             )
  //             .getValue();

  //           const newRecordWithSelected = {
  //             ...newRecord,
  //             selected: objectRecordMultiSelectCheckedRecordsIds.some(
  //               (checkedRecordId) => checkedRecordId === newRecord.record.id,
  //             ),
  //           };

  //           if (
  //             !isDeeplyEqual(
  //               newRecordWithSelected.selected,
  //               currentRecord?.selected,
  //             )
  //           ) {
  //             set(
  //               objectRecordMultiSelectComponentFamilyState({
  //                 scopeId: scopeId,
  //                 familyKey: newRecordWithSelected.record.id,
  //               }),
  //               newRecordWithSelected,
  //             );
  //           }
  //         }
  //       },
  //     [objectRecordMultiSelectCheckedRecordsIds, scopeId],
  //   );

  //   useEffect(() => {
  //     const allRecords = matchesSearchFilterObjectRecords ?? [];
  //     updateRecords(allRecords);
  //     const allRecordsIds = allRecords.map((record) => record.record.id);
  //     if (!isDeeplyEqual(allRecordsIds, objectRecordsIdsMultiSelect)) {
  //       setObjectRecordsIdsMultiSelect(allRecordsIds);
  //     }
  //   }, [
  //     matchesSearchFilterObjectRecords,
  //     objectRecordsIdsMultiSelect,
  //     setObjectRecordsIdsMultiSelect,
  //     updateRecords,
  //   ]);

  //   useEffect(() => {
  //     setObjectRecordMultiSelectCheckedRecordsIds(
  //       selectedObjectRecordIds.map((rec) => rec.id),
  //     );
  //   }, [selectedObjectRecordIds, setObjectRecordMultiSelectCheckedRecordsIds]);

  useEffect(() => {
    setRecordMultiSelectIsLoading(loading);
  }, [loading, setRecordMultiSelectIsLoading]);

  return <></>;
};
