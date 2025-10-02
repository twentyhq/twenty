import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const RECORD_ACTIONS: Array<{
  label: string;
  type: Extract<
    WorkflowActionType,
    'CREATE_RECORD' | 'UPDATE_RECORD' | 'DELETE_RECORD' | 'UPSERT_RECORD' | 'FIND_RECORDS'
  >;
  icon: string;
}> = [
  {
    label: 'Create Record',
    type: 'CREATE_RECORD',
    icon: 'IconPlus',
  },
  {
    label: 'Update Record',
    type: 'UPDATE_RECORD',
    icon: 'IconReload',
  },
  {
    label: 'Delete Record',
    type: 'DELETE_RECORD',
    icon: 'IconTrash',
  },
  {
    label: 'Upsert Record',
    type: 'UPSERT_RECORD',
    icon: 'IconPencilPlus',
  },
  {
    label: 'Search Records',
    type: 'FIND_RECORDS',
    icon: 'IconSearch',
  },
];
