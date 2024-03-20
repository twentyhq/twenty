import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewEditModeComponentState = createComponentState<
  'none' | 'edit' | 'create'
>({
  key: 'viewEditModeComponentState',
  defaultValue: 'none',
});
