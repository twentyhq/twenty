import BaseNode from '@/chatbot/components/ui/BaseNode';
import styled from '@emotion/styled';
import { Handle, Node, NodeProps, Position, useReactFlow } from '@xyflow/react';
import { memo, useEffect, useRef } from 'react';

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

function TextNode({
  id,
  data,
  isConnectable,
}: NodeProps<Node<{ text: string }>>) {
  const { updateNodeData } = useReactFlow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    console.log('data text input:', data);
  }, [data]);

  const handleInputChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = evt.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    updateNodeData(id, { text: textarea.value });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [data.text]);

  return (
    <BaseNode icon={'IconTextSize'} title={'Mensagem Inicial'}>
      {/* <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      /> */}
      <StyledDiv>
        <textarea
          id="text"
          ref={textareaRef}
          onChange={handleInputChange}
          value={data.text}
        />
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
