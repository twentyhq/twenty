import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const selectableListOnEnterComponentState = createComponentState<
  ((itemId: string) => void) | undefined
>({
  key: 'selectableListOnEnterComponentState',
  defaultValue: undefined,
});
