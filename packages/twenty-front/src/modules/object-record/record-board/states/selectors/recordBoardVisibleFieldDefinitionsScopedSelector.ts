import { recordBoardFieldDefinitionsStateScopeMap } from '@/object-record/record-board/states/recordBoardFieldDefinitionsStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

export const recordBoardVisibleFieldDefinitionsScopedSelector =
  createSelectorReadOnlyScopeMap({
    key: 'recordBoardVisibleFieldDefinitionsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(recordBoardFieldDefinitionsStateScopeMap({ scopeId }))
          .filter((field) => field.isVisible)
          .sort((a, b) => a.position - b.position),
  });
