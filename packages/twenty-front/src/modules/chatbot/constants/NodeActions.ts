import { NodeActionType, OtherNodeActionType } from '@/chatbot/types/Node';

export const NODE_ACTIONS: Array<{
  label: string;
  type: Extract<NodeActionType, 'TEXT' | 'IMAGE' | 'FILE'>;
  icon: string;
}> = [
  {
    label: 'Text',
    type: 'TEXT',
    icon: 'IconTextSize',
  },
  // {
  //   label: 'Image',
  //   type: 'IMAGE',
  //   icon: 'IconPhoto',
  // },
  // {
  //   label: 'File',
  //   type: 'FILE',
  //   icon: 'IconFileImport',
  // },
];

export const OTHER_NODE_ACTIONS: Array<{
  label: string;
  type: Extract<OtherNodeActionType, 'CONDITION'>;
  icon: string;
}> = [
  {
    label: 'If / Else Logic',
    type: 'CONDITION',
    icon: 'IconHierarchy',
  },
];
