import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const setObjectFilterDropdownStatesFromRecordFilter = ({
  store,
  objectFilterDropdownInstanceId,
  recordFilter,
  fieldMetadataItemId,
}: {
  store: ReturnType<typeof createStore>;
  objectFilterDropdownInstanceId: string;
  recordFilter: RecordFilter;
  fieldMetadataItemId: string | undefined;
}) => {
  const instanceId = objectFilterDropdownInstanceId;

  if (isDefined(fieldMetadataItemId)) {
    store.set(
      fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
        instanceId,
      }),
      fieldMetadataItemId,
    );
  }

  store.set(
    selectedOperandInDropdownComponentState.atomFamily({ instanceId }),
    recordFilter.operand,
  );

  store.set(
    objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
      instanceId,
    }),
    recordFilter,
  );

  store.set(
    subFieldNameUsedInDropdownComponentState.atomFamily({ instanceId }),
    recordFilter.subFieldName,
  );

  store.set(
    relationTargetFieldMetadataIdUsedInDropdownComponentState.atomFamily({
      instanceId,
    }),
    recordFilter.relationTargetFieldMetadataId ?? null,
  );
};
