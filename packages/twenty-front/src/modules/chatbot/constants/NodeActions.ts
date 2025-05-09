import { NodeActionType, OtherNodeActionType } from '@/chatbot/types/Node';

type BaseAction = {
  label: string;
  icon: string;
};

type NodeAction = BaseAction & {
  type: Extract<NodeActionType, 'text' | 'image' | 'file'>;
};

type OtherNodeAction = BaseAction & {
  type: Extract<OtherNodeActionType, 'condition'>;
};

export type ChatbotAction = NodeAction | OtherNodeAction;

export const NODE_ACTIONS: Array<NodeAction> = [
  {
    label: 'Text',
    type: 'text',
    icon: 'IconTextSize',
  },
  {
    label: 'Image',
    type: 'image',
    icon: 'IconPhoto',
  },
  // {
  //   label: 'File',
  //   type: 'file',
  //   icon: 'IconFileImport',
  // },
];

export const OTHER_NODE_ACTIONS: Array<OtherNodeAction> = [
  {
    label: 'If/Else',
    type: 'condition',
    icon: 'IconHierarchy',
  },
];
