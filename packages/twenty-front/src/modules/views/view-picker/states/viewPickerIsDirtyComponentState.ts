import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerIsDirtyComponentState = createComponentState<boolean>({
  key: 'viewPickerIsDirtyComponentState',
  defaultValue: false,
});
