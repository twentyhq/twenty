/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/ui/BaseNode';
import LogicNode from '@/chatbot/components/ui/LogicNode';
import {
  CondicionalState,
  LogicNodeData,
} from '@/chatbot/types/LogicNodeDataType';
import styled from '@emotion/styled';
import { Handle, Node, NodeProps, Position, useReactFlow } from '@xyflow/react';
import { memo, useCallback, useState } from 'react';
import { Button } from 'twenty-ui';

const initialState: CondicionalState = {
  logicNodes: [],
  logicNodeData: [],
};

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  gap: 12px;
  margin-top: 8px;
`;

function CondicionalNode({
  id,
  isConnectable,
}: NodeProps<Node<{ logic: CondicionalState }>>) {
  const { updateNodeData } = useReactFlow();
  const [state, setState] = useState<CondicionalState>(initialState);

  const handleAddLogicNode = () => {
    setState((prevState) => {
      const newLogicNodeData = [
        ...prevState.logicNodeData,
        [{ comparison: '==', inputText: '', conditionValue: '' }],
      ];

      updateNodeData(id, {
        logic: {
          logicNodes: [...prevState.logicNodes, prevState.logicNodes.length],
          logicNodeData: newLogicNodeData,
        },
      });

      return {
        ...prevState,
        logicNodes: [...prevState.logicNodes, prevState.logicNodes.length],
        logicNodeData: newLogicNodeData,
      };
    });
  };

  const handleGroupsChange = useCallback(
    (updatedGroups: LogicNodeData[], nodeIndex: number) => {
      setState((prevState) => {
        const updatedLogicNodeData = [...prevState.logicNodeData];
        if (updatedLogicNodeData[nodeIndex] !== updatedGroups) {
          updatedLogicNodeData[nodeIndex] = updatedGroups;
          return { ...prevState, logicNodeData: updatedLogicNodeData };
        }
        return prevState;
      });
    },
    [],
  );

  return (
    <BaseNode icon={'IconLogicAnd'} title={'Condicional'}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <StyledDiv>
        {state.logicNodes.map((node, index) => (
          <LogicNode
            key={index}
            dropdownId={`logicSelect-${index}`}
            onGroupsChange={(updatedGroups) =>
              handleGroupsChange(updatedGroups, index)
            }
          >
            <Handle
              id={`b-${index}`}
              type="source"
              position={Position.Right}
              isConnectable={isConnectable}
            />
          </LogicNode>
        ))}
      </StyledDiv>

      <Button
        onClick={handleAddLogicNode}
        title={'Adicionar'}
        fullWidth
        justify="center"
      />
      <Handle
        id={'a'}
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
}

export default memo(CondicionalNode);
