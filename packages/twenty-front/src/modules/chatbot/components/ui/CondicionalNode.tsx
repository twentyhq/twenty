/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/ui/BaseNode';
import LogicNode from '@/chatbot/components/ui/LogicNode';
import {
  CondicionalState,
  ExtendedLogicNodeData,
  LogicNodeData,
} from '@/chatbot/types/LogicNodeDataType';
import styled from '@emotion/styled';
import {
  Handle,
  Node,
  NodeProps,
  Position,
  useNodeConnections,
  useReactFlow,
} from '@xyflow/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { Button } from 'twenty-ui/input';

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
  data,
  isConnectable,
}: NodeProps<Node<{ title: string; logic: CondicionalState }>>) {
  const { updateNodeData } = useReactFlow();
  const [state, setState] = useState<CondicionalState>(initialState);

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (data.logic) {
      setState(data.logic);
    }
  }, [data.logic]);

  const connections = useNodeConnections({
    id,
    handleType: 'source',
  });

  const handleAddLogicNode = () => {
    setState((prevState) => {
      const newLogicNodeData = [
        ...prevState.logicNodeData,
        [
          {
            comparison: '==',
            inputText: '',
            conditionValue: '',
          },
        ],
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
    (updatedGroups: ExtendedLogicNodeData[], nodeIndex: number) => {
      setState((prevState) => {
        const updatedLogicNodeData = [...prevState.logicNodeData];

        if (updatedLogicNodeData[nodeIndex] !== updatedGroups) {
          updatedLogicNodeData[nodeIndex] = updatedGroups;

          const newState = {
            ...prevState,
            logicNodeData: updatedLogicNodeData,
          };

          updateNodeData(id, {
            logic: newState,
          });

          return newState;
        }

        return prevState;
      });
    },
    [],
  );

  return (
    <BaseNode icon={'IconLogicAnd'} title={'Condicional'}>
      <Handle
        title={data.title}
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <StyledDiv>
        {state.logicNodes.map((_, index) => {
          const conn = connections[index];
          const nodeId = conn.target ?? undefined;
          const sourceHandle = conn.sourceHandle ?? undefined;

          const rawGroup = state.logicNodeData[index];

          const sanitizedGroup: ExtendedLogicNodeData[] = Array.isArray(
            rawGroup,
          )
            ? rawGroup
            : Object.entries(rawGroup)
                .filter(([key]) => !isNaN(Number(key)))
                .map(([, value]) => value as LogicNodeData);

          return (
            <LogicNode
              key={index}
              dropdownId={`logicSelect-${index}`}
              groupsData={sanitizedGroup}
              onGroupsChange={(updatedGroups) => {
                const extendedGroups: ExtendedLogicNodeData[] =
                  updatedGroups.map((group) => ({
                    ...group,
                    outgoingEdgeId: sourceHandle,
                    outgoingNodeId: nodeId,
                  }));

                handleGroupsChange(extendedGroups, index);
              }}
            >
              <Handle
                id={`b-${index}`}
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
              />
            </LogicNode>
          );
        })}
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
