import { createState } from '@ui/utilities/state/utils/createState';

export const recordIndexKanbanFieldMetadataIdState = createState<string | null>(
  {
    key: 'recordIndexKanbanFieldMetadataIdState',
    defaultValue: null,
  },
);
