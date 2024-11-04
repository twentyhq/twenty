import { RecordGroupDefinitionId } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableRecordGroupIdsComponentState } from '@/object-record/record-table/states/tableRecordGroupIdsComponentState';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export const tableRowIdsByGroupComponentFamilyState =
  createComponentFamilyStateV2<string[], RecordGroupDefinitionId>({
    key: 'tableRowIdsByGroupComponentFamilyState',
    defaultValue: [],
    componentInstanceContext: RecordTableComponentInstanceContext,
    effects: ({ familyKey, instanceId }) => [
      ({ setSelf, onSet, getPromise, set }) => {
        // Initialize the atom with the default value
        setSelf([]);

        const recordGroupIdsState =
          tableRecordGroupIdsComponentState.atomFamily({
            instanceId,
          });

        // Add the key to recordGroupKeysState if it's not already present
        getPromise(recordGroupIdsState).then((keys) => {
          if (!keys.includes(param)) {
            set(recordGroupKeysState, [...keys, param]);
          }
        });

        // Optional: Remove the key from recordGroupKeysState when the atom is reset
        onSet((newValue, oldValue, isReset) => {
          if (isReset) {
            set(recordGroupKeysState, (keys) =>
              keys.filter((key) => key !== param),
            );
          }
        });
      },
    ],
  });
