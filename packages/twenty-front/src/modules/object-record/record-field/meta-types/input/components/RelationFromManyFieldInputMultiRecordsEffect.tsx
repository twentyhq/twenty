import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { objectRecordMultiSelectComponentFamilyState } from '@/object-record/record-field/states/objectRecordMultiSelectComponentFamilyState';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useRelationPickerEntitiesOptions } from '@/object-record/relation-picker/hooks/useRelationPickerEntitiesOptions';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RelationFromManyFieldInputMultiRecordsEffect = () => {
  const { fieldValue, fieldDefinition } = useRelationField<EntityForSelect[]>();
  const scopeId = useAvailableScopeIdOrThrow(
    RelationPickerScopeInternalContext,
  );
  const {
    objectRecordsIdsMultiSelectState,
    objectRecordMultiSelectCheckedRecordsIdsState,
    recordMultiSelectIsLoadingState,
  } = useObjectRecordMultiSelectScopedStates(scopeId);
  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilState(objectRecordsIdsMultiSelectState);

  const { entities } = useRelationPickerEntitiesOptions({
    relationObjectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const setRecordMultiSelectIsLoading = useSetRecoilState(
    recordMultiSelectIsLoadingState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const allRecords = useMemo(
    () => [
      ...entities.entitiesToSelect.map((entity) => {
        const { record, ...recordIdentifier } = entity;
        return {
          objectMetadataItem: objectMetadataItem,
          record: record,
          recordIdentifier: recordIdentifier,
        };
      }),
    ],
    [entities.entitiesToSelect, objectMetadataItem],
  );

  const [
    objectRecordMultiSelectCheckedRecordsIds,
    setObjectRecordMultiSelectCheckedRecordsIds,
  ] = useRecoilState(objectRecordMultiSelectCheckedRecordsIdsState);

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

          const newRecordWithSelected = {
            ...newRecord,
            selected: objectRecordMultiSelectCheckedRecordsIds.includes(
              newRecord.record.id,
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
    [objectRecordMultiSelectCheckedRecordsIds, scopeId],
  );

  useEffect(() => {
    updateRecords(allRecords);
    const allRecordsIds = allRecords.map((record) => record.record.id);
    if (!isDeeplyEqual(allRecordsIds, objectRecordsIdsMultiSelect)) {
      setObjectRecordsIdsMultiSelect(allRecordsIds);
    }
  }, [
    allRecords,
    objectRecordsIdsMultiSelect,
    setObjectRecordsIdsMultiSelect,
    updateRecords,
  ]);

  useEffect(() => {
    setObjectRecordMultiSelectCheckedRecordsIds(
      fieldValue
        ? fieldValue.map((fieldValueItem: EntityForSelect) => fieldValueItem.id)
        : [],
    );
  }, [fieldValue, setObjectRecordMultiSelectCheckedRecordsIds]);

  useEffect(() => {
    setRecordMultiSelectIsLoading(entities.loading);
  }, [entities.loading, setRecordMultiSelectIsLoading]);

  return <></>;
};
