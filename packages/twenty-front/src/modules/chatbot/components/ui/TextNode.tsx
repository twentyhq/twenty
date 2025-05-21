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

const StyledDiv = styled.div`
  display: flex;
  width: 100%;
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
  word-break: break-all;
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

  const targetConnections = useNodeConnections({
    id,
    handleType: 'target',
  });

  const sourceConnections = useNodeConnections({
    id,
    handleType: 'source',
  });

  useEffect(() => {
    if (targetConnections.length > 0) {
      const connection = targetConnections[0];
      const sourceHandle = connection.sourceHandle || '';
      const nodeId = connection.source;

      updateNodeData(id, {
        ...data,
        incomingEdgeId: sourceHandle,
        incomingNodeId: nodeId,
      });
    }

    if (sourceConnections.length > 0) {
      const connection = sourceConnections[0];
      const sourceHandle = connection.sourceHandle;
      const nodeId = connection.target;

      if (data.nodeStart) {
        updateNodeData(id, {
          ...data,
          outgoingNodeId: nodeId || '2',
        });
      } else {
        updateNodeData(id, {
          ...data,
          outgoingEdgeId: sourceHandle,
          outgoingNodeId: nodeId,
        });
      }
    }
  }, [targetConnections, sourceConnections]);

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (textareaRef.current) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.text]);

  return (
    <BaseNode
      icon={'IconTextSize'}
      title={data.title ?? 'Node title'}
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
        <StyledTextContainer>
          {data.text ?? 'Insert text to be sent'}
        </StyledTextContainer>
      </StyledDiv>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </BaseNode>
  );
}

export default memo(TextNode);
