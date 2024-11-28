import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRowIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRowIdsByGroupComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';

export const numberOfTableRowIdsByGroupComponentFamilySelector =
  createComponentFamilySelectorV2<number, RecordGroupDefinition['id']>({
    key: 'numberOfTableRowIdsByGroupComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) =>
        get(
          recordIndexRowIdsByGroupComponentFamilyState.atomFamily({
            instanceId,
            familyKey,
          }),
        ).length,
  });
