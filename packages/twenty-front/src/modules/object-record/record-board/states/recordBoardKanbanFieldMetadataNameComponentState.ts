import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordBoardKanbanFieldMetadataNameComponentState =
  createComponentState<string | undefined>({
    key: 'recordBoardKanbanFieldMetadataNameComponentState',
    defaultValue: undefined,
  });
