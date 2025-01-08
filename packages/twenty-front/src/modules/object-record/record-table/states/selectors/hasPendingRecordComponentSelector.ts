import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTablePendingRecordIdByGroupComponentFamilyState } from '@/object-record/record-table/states/recordTablePendingRecordIdByGroupComponentFamilyState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { isDefined } from '~/utils/isDefined';

export const hasPendingRecordComponentSelector = createComponentSelectorV2({
  key: 'hasPendingRecordComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const hasRecordGroups = get(
        hasRecordGroupsComponentSelector.selectorFamily({ instanceId }),
      );

      if (!hasRecordGroups) {
        const pendingRecordId = get(
          recordTablePendingRecordIdComponentState.atomFamily({ instanceId }),
        );

        return isDefined(pendingRecordId);
      }

      const recordGroupIds = get(
        recordGroupIdsComponentState.atomFamily({ instanceId }),
      );

      for (const recordGroupId of recordGroupIds) {
        const pendingRecordId = get(
          recordTablePendingRecordIdByGroupComponentFamilyState.atomFamily({
            instanceId,
            familyKey: recordGroupId,
          }),
        );

        if (isDefined(pendingRecordId)) {
          return true;
        }
      }

      return false;
    },
});
