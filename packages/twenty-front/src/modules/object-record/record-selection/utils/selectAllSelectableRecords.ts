import { type Store } from 'jotai/vanilla/store';

import { recordIndexSelectableRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexSelectableRecordIdsComponentSelector';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';

export const selectAllSelectableRecords = ({
  store,
  instanceId,
}: {
  store: Store;
  instanceId: string;
}) => {
  const selectableRecordIds = store.get(
    recordIndexSelectableRecordIdsComponentSelector.selectorFamily({
      instanceId,
    }),
  );

  for (const recordId of selectableRecordIds) {
    store.set(
      isRecordSelectedComponentFamilyState.atomFamily({
        instanceId,
        familyKey: recordId,
      }),
      true,
    );
  }

  store.set(
    recordSelectionRangeComponentState.atomFamily({ instanceId }),
    null,
  );
};
