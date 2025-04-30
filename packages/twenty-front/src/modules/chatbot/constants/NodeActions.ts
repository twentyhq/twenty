import { NodeActionType, OtherNodeActionType } from '@/chatbot/types/Node';

export const NODE_ACTIONS: Array<{
  label: string;
  type: Extract<NodeActionType, 'text' | 'image' | 'file'>;
  icon: string;
}> = [
  {
    label: 'Text',
    type: 'text',
    icon: 'IconTextSize',
  },
  // {
  //   label: 'Image',
  //   type: 'image',
  //   icon: 'IconPhoto',
  // },
  // {
  //   label: 'File',
  //   type: 'file',
  //   icon: 'IconFileImport',
  // },
];

export const OTHER_NODE_ACTIONS: Array<{
  label: string;
  type: Extract<OtherNodeActionType, 'condition'>;
  icon: string;
}> = [
  {
    label: 'If / Else Logic',
    type: 'condition',
    icon: 'IconHierarchy',
  },
];
