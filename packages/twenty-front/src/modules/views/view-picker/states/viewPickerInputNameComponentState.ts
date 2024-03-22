import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerInputNameComponentState = createComponentState<string>({
  key: 'viewPickerInputNameComponentState',
  defaultValue: '',
});
