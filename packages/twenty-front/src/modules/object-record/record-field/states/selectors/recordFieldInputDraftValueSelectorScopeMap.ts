import { recordFieldInputDraftValueStateScopeMap } from '@/object-record/record-field/states/recordFieldInputDraftValueStateScopeMap';
import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

export const recordFieldInputDraftValueSelectorScopeMap =
  createSelectorScopeMap<any>({
    key: 'recordFieldInputDraftValueSelectorScopeMap',
    get:
      <T>({ scopeId }: { scopeId: string }) =>
      ({ get }) =>
        get(recordFieldInputDraftValueStateScopeMap({ scopeId })) as T,
    set:
      <T>({ scopeId }: { scopeId: string }) =>
      ({ set }, newValue: T) => {
        set(recordFieldInputDraftValueStateScopeMap({ scopeId }), newValue);
      },
  });
