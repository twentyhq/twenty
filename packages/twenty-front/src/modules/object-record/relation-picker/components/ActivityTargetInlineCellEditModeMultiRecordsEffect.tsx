import { useEffect } from 'react';
import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { objectRecordMultiSelectComponentFamilyState } from '@/object-record/record-field/states/objectRecordMultiSelectComponentFamilyState';
import { objectRecordMultiSelectMatchesFilterRecordsIdsComponentState } from '@/object-record/record-field/states/objectRecordMultiSelectMatchesFilterRecordsIdsComponentState';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { SelectedObjectRecordId } from '@/object-record/types/SelectedObjectRecordId';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ActivityTargetInlineCellEditModeMultiRecordsEffect = ({
  selectedObjectRecordIds,
}: {
  selectedObjectRecordIds: SelectedObjectRecordId[];
}) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
  );
  const {
    objectRecordsIdsMultiSelectState,
    objectRecordMultiSelectCheckedRecordsIdsState,
  } = useObjectRecordMultiSelectScopedStates(scopeId);
  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilState(objectRecordsIdsMultiSelectState);

  const setObjectRecordMultiSelectCheckedRecordsIds = useSetRecoilState(
    objectRecordMultiSelectCheckedRecordsIdsState,
  );

  const updateRecords = useRecoilCallback(
    ({ snapshot, set }) =>
      (newRecords: ObjectRecordForSelect[]) => {
        for (const newRecord of newRecords) {
          const currentRecord = snapshot
            .getLoadable(
              objectRecordMultiSelectComponentFamilyState({
                scopeId: scopeId,
                familyKey: newRecord.record.id,
              }),
            )
            .getValue();

          const objectRecordMultiSelectCheckedRecordsIds = snapshot
            .getLoadable(objectRecordMultiSelectCheckedRecordsIdsState)
            .getValue();

          const newRecordWithSelected = {
            ...newRecord,
            selected: objectRecordMultiSelectCheckedRecordsIds.some(
              (checkedRecordId) => checkedRecordId === newRecord.record.id,
            ),
          };

          if (
            !isDeeplyEqual(
              newRecordWithSelected.selected,
              currentRecord?.selected,
            )
          ) {
            set(
              objectRecordMultiSelectComponentFamilyState({
                scopeId: scopeId,
                familyKey: newRecordWithSelected.record.id,
              }),
              newRecordWithSelected,
            );
          }
        }
      },
    [objectRecordMultiSelectCheckedRecordsIdsState, scopeId],
  );

  const matchesSearchFilterObjectRecords = useRecoilValue(
    objectRecordMultiSelectMatchesFilterRecordsIdsComponentState({
      scopeId,
    }),
  );

  useEffect(() => {
    const allRecords = matchesSearchFilterObjectRecords ?? [];
    updateRecords(allRecords);
    const allRecordsIds = allRecords.map((record) => record.record.id);
    if (!isDeeplyEqual(allRecordsIds, objectRecordsIdsMultiSelect)) {
      setObjectRecordsIdsMultiSelect(allRecordsIds);
    }
  }, [
    matchesSearchFilterObjectRecords,
    objectRecordsIdsMultiSelect,
    setObjectRecordsIdsMultiSelect,
    updateRecords,
  ]);

  useEffect(() => {
    setObjectRecordMultiSelectCheckedRecordsIds(
      selectedObjectRecordIds.map((rec) => rec.id),
    );
  }, [selectedObjectRecordIds, setObjectRecordMultiSelectCheckedRecordsIds]);

  return <></>;
};
