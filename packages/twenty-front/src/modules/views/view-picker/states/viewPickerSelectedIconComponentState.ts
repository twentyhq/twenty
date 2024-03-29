import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerSelectedIconComponentState =
  createComponentState<string>({
    key: 'viewPickerSelectedIconComponentState',
    defaultValue: '',
  });
