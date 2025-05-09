import { NewLogicNodeData } from '@/chatbot/types/LogicNodeDataType';
import { v4 } from 'uuid';

export const createNode = (type: string) => {
  const baseNode = {
    id: v4(),
    type,
    position: { x: 0, y: 0 },
  };

  switch (type) {
    case 'text':
      return {
        ...baseNode,
        data: {
          nodeStart: false,
        },
      };
    case 'condition': {
      const initialLogicNode: NewLogicNodeData = {
        option: '1',
        comparison: '==',
        sectorId: '',
        conditionValue: '||',
      };

      return {
        ...baseNode,
        data: {
          logic: {
            logicNodes: [0],
            logicNodeData: [initialLogicNode],
          },
        },
      };
    }
    case 'image':
      return {
        ...baseNode,
        data: {
          imageUrl: '',
        },
      };
  }
};
