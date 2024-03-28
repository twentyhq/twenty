import { createComponentState } from 'twenty-ui';

export const viewPickerModeComponentState = createComponentState<
  'list' | 'edit' | 'create'
>({
  key: 'viewEditModeComponentState',
  defaultValue: 'list',
});
