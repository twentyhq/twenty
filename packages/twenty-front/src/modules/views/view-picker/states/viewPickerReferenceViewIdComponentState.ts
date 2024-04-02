import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerReferenceViewIdComponentState =
  createComponentState<string>({
    key: 'viewPickerReferenceViewIdComponentState',
    defaultValue: '',
  });
