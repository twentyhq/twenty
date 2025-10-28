import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerSelectedRoleIdsComponentState = createComponentState<
  string[]
>({
  key: 'viewPickerSelectedRoleIdsComponentState',
  defaultValue: [],
});

