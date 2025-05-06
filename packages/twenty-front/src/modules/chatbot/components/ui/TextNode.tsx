/* eslint-disable @nx/workspace-component-props-naming */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import BaseNode from '@/chatbot/components/ui/BaseNode';
import styled from '@emotion/styled';
import {
  Handle,
  Node,
  NodeProps,
  Position,
  useNodeConnections,
  useReactFlow,
} from '@xyflow/react';
import { memo, useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledDiv = styled.div`
  width: 100%;
  display: flex;

  textarea {
    resize: none;
    width: 100%;
    padding: ${({ theme }) => theme.spacing(2)};
    border: none;
    outline: none;
    color: ${({ theme }) => theme.font.color.primary};
    font-size: ${({ theme }) => theme.font.size.sm};
    box-sizing: border-box;
    background-color: ${({ theme }) => theme.background.quaternary};
    border-radius: ${({ theme }) => theme.border.radius.md};

    &:focus {
      border: 1px solid ${({ theme }) => theme.color.blue};
    }

    &:hover {
      cursor: pointer;
    }
  }
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

function TextNode({
  id,
  data,
  isConnectable,
}: NodeProps<
  Node<{
    icon: string;
    title: string;
    text?: string;
    nodeStart: boolean;
  }>
>) {
  const { updateNodeData } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const connections = useNodeConnections({
    id,
    handleType: 'target',
  });

  useEffect(() => {
    if (connections.length > 0) {
      const connection = connections[0];
      const sourceHandle = connection.sourceHandle || '';
      const nodeId = connection.source;

      updateNodeData(id, {
        ...data,
        incomingEdgeId: sourceHandle,
        incomingNodeId: nodeId,
      });
    }

    if (data.nodeStart) {
      updateNodeData(id, {
        ...data,
        outgoingNodeId: '2',
      });
    }
  }, [connections]);

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (isDefined(textareaRef.current)) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.text]);

  return (
    <BaseNode
      icon={'IconTextSize'}
      title={data.title}
      nodeStart={data.nodeStart}
    >
      {!data.nodeStart && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}
      <StyledDiv>
        <StyledTextContainer>{data.text}</StyledTextContainer>
      </StyledDiv>
      {data.nodeStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      )}
    </BaseNode>
  );
}

export default memo(TextNode);
