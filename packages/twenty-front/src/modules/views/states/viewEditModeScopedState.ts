import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewEditModeScopedState = createComponentState<
  'none' | 'edit' | 'create'
>({
  key: 'viewEditModeScopedState',
  defaultValue: 'none',
});
