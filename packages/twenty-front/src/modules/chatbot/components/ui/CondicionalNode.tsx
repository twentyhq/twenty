/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/ui/BaseNode';
import { NewConditionalState } from '@/chatbot/types/LogicNodeDataType';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import styled from '@emotion/styled';
import {
  Handle,
  Node,
  NodeProps,
  Position,
  useNodeConnections,
} from '@xyflow/react';
import { memo, useEffect, useState } from 'react';
import { H3Title, Label } from 'twenty-ui/display';

const initialState: NewConditionalState = {
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

const StyledLogicNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledTextContainer = styled.div`
  background-color: ${({ theme }) => theme.background.quaternary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.sm};
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  white-space: pre-wrap;
  width: 100%;
`;

const StyledH3Title = styled(H3Title)`
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledOption = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledLabel = styled(Label)`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledHandle = styled(Handle)`
  position: absolute;
  right: 0;
`;

function CondicionalNode({
  id,
  data,
  isConnectable,
}: NodeProps<
  Node<{ title: string; text?: string; logic: NewConditionalState }>
>) {
  const [state, setState] = useState<NewConditionalState>(initialState);

  // const { updateNodeData } = useReactFlow();
  const { sectors } = useFindAllSectors();

  const connections = useNodeConnections({
    id,
    handleType: 'source',
  });

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (data.logic) {
      setState(data.logic);
    }
  }, [data.logic]);

  const getSectorName = (sectorId: string) =>
    sectors?.find((s) => s.id === sectorId)?.name ?? sectorId;

  return (
    <BaseNode icon={'IconHierarchy'} title={data.title ?? 'Node title'}>
      <Handle
        title={data.title}
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <StyledDiv>
        <StyledLogicNodeWrapper>
          {data.text && <StyledTextContainer>{data.text}</StyledTextContainer>}
          <StyledH3Title title={'Options'} />
          <StyledOptionsContainer>
            {state.logicNodeData.map((nodeData) => {
              // const conn = connections[Number(nodeData.option)];
              // const nodeId = conn?.target;
              // const sourceHandle = conn?.sourceHandle;

              return (
                <StyledOption key={nodeData.option}>
                  <StyledLabel>
                    {nodeData.option} - {getSectorName(nodeData.sectorId)}
                  </StyledLabel>
                  <StyledHandle
                    id={`b-${nodeData.option}`}
                    type="source"
                    position={Position.Right}
                    isConnectable={isConnectable}
                  />
                </StyledOption>
              );
            })}
          </StyledOptionsContainer>
        </StyledLogicNodeWrapper>
      </StyledDiv>
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
