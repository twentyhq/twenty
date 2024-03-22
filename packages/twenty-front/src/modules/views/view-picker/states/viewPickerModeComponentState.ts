import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerModeComponentState = createComponentState<
  'list' | 'edit' | 'create'
>({
  key: 'viewEditModeComponentState',
  defaultValue: 'list',
});
