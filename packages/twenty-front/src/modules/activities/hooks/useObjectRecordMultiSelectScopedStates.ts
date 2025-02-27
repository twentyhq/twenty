import { objectRecordsIdsMultiSelecComponentState } from '@/activities/states/objectRecordsIdsMultiSelectComponentState';
import { objectRecordMultiSelectCheckedRecordsIdsComponentState } from '@/object-record/multiple-objects/multiple-objects-picker/states/objectRecordMultiSelectCheckedRecordsIdsComponentState';
import { objectRecordMultiSelectComponentFamilyState } from '@/object-record/multiple-objects/multiple-objects-picker/states/objectRecordMultiSelectComponentFamilyState';
import { recordMultiSelectIsLoadingComponentState } from '@/object-record/multiple-objects/multiple-objects-picker/states/recordMultiSelectIsLoadingComponentState';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useObjectRecordMultiSelectScopedStates = (scopeId: string) => {
  const objectRecordsIdsMultiSelectState = extractComponentState(
    objectRecordsIdsMultiSelecComponentState,
    scopeId,
  );

  const objectRecordMultiSelectCheckedRecordsIdsState = extractComponentState(
    objectRecordMultiSelectCheckedRecordsIdsComponentState,
    scopeId,
  );

  const objectRecordMultiSelectFamilyState = extractComponentFamilyState(
    objectRecordMultiSelectComponentFamilyState,
    scopeId,
  );

  const recordMultiSelectIsLoadingState = extractComponentState(
    recordMultiSelectIsLoadingComponentState,
    scopeId,
  );

  return {
    objectRecordsIdsMultiSelectState,
    objectRecordMultiSelectCheckedRecordsIdsState,
    objectRecordMultiSelectFamilyState,
    recordMultiSelectIsLoadingState,
  };
};
