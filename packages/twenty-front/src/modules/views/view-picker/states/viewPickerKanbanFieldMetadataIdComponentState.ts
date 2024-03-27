import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerKanbanFieldMetadataIdComponentState =
  createComponentState<string>({
    key: 'viewPickerKanbanFieldMetadataIdComponentState',
    defaultValue: '',
  });
