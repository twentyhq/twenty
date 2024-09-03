import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewPickerKanbanFieldMetadataIdInstanceState =
  createInstanceState<string>({
    key: 'viewPickerKanbanFieldMetadataIdInstanceState',
    defaultValue: '',
    instanceContext: ViewInstanceContext,
  });
