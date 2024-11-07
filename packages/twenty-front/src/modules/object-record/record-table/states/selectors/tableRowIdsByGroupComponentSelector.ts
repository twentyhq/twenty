import { RecordGroupDefinitionId } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableRowIdsByGroupComponentState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentState';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';

export const tableRowIdsByGroupComponentSelector =
  createComponentFamilySelectorV2<string[], RecordGroupDefinitionId>({
    key: 'tableRowIdsByGroupComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ familyKey, instanceId }) =>
      ({ get }) => {
        const tableRowIdsByGroup = get(
          tableRowIdsByGroupComponentState.atomFamily({ instanceId }),
        );
        const rowIds = tableRowIdsByGroup.get(familyKey) ?? [];

        console.log('tableRowIdsByGroupComponentSelector', {
          [familyKey]: rowIds,
        });

        return rowIds;
      },
  });
