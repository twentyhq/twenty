import { createComponentSelector } from 'twenty-ui';

import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';

export const recordFieldInputDraftValueComponentSelector =
  createComponentSelector<any>({
    key: 'recordFieldInputDraftValueComponentSelector',
    get:
      <T>({ scopeId }: { scopeId: string }) =>
      ({ get }) =>
        get(recordFieldInputDraftValueComponentState({ scopeId })) as T,
    set:
      <T>({ scopeId }: { scopeId: string }) =>
      ({ set }, newValue: T) => {
        set(recordFieldInputDraftValueComponentState({ scopeId }), newValue);
      },
  });
