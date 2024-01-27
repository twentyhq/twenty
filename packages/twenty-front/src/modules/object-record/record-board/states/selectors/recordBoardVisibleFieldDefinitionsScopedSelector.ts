import { recordBoardFieldDefinitionsStateScopeMap } from '@/object-record/record-board/states/recordBoardFieldDefinitionsStateScopeMap';
import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

export const recordBoardVisibleFieldDefinitionsScopedSelector =
  createSelectorScopeMap({
    key: 'recordBoardVisibleFieldDefinitionsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) =>
        get(recordBoardFieldDefinitionsStateScopeMap({ scopeId }))
          .filter((field) => field.isVisible)
          .sort((a, b) => a.position - b.position),
  });
