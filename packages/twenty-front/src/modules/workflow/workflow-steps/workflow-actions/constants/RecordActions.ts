import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const RECORD_ACTIONS: Array<{
  label: string;
  type: Extract<
    WorkflowActionType,
    'CREATE_RECORD' | 'UPDATE_RECORD' | 'DELETE_RECORD' | 'CREATE_OR_UPDATE_RECORD' | 'FIND_RECORDS'
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
    label: 'Create or Update Record',
    type: 'CREATE_OR_UPDATE_RECORD',
    icon: 'IconPencilPlus',
  },
  {
    label: 'Search Records',
    type: 'FIND_RECORDS',
    icon: 'IconSearch',
  },
];
