import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { ChatbotFlow } from '@/chatbot/types/chatbotFlow.type';
import { getChatbotNodeLabel } from '@/chatbot/utils/getChatbotNodeLabel';
import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';
import { Node } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Label } from 'twenty-ui/display';

type ChatbotFlowTextEventFormProps = {
  selectedNode: Node;
};

const StyledHeader = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xl};
  width: fit-content;
  max-width: 420px;
  & > input:disabled {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledHeaderType = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledStepBody = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
  padding-block: ${({ theme }) => theme.spacing(4)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};

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
    border-radius: ${({ theme }) => theme.border.radius.sm};

    &:focus {
      border: 1px solid ${({ theme }) => theme.color.blue};
    }

    &:hover {
      cursor: pointer;
    }
  }
`;

const StyledLabel = styled(Label)`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

export const ChatbotFlowTextEventForm = ({
  selectedNode,
}: ChatbotFlowTextEventFormProps) => {
  const initialTitle = selectedNode.data.title ?? 'Node title';
  const initialText =
    (selectedNode.data?.text as string | undefined) ?? 'Insert text to be sent';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState<string>(initialText);

  const { updateFlow } = useUpdateChatbotFlow();

  const chatbotFlow = useRecoilValue(chatbotFlowState);

  const handleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  const handleInputChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = evt.target;
    const inputValue = textarea.value;

    if (inputValue.length > 4000) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    setText(inputValue);

    const flow = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        text: inputValue,
      },
    };

    setChatbotFlowSelectedNode(flow);
  };

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (isDefined(textareaRef.current)) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [selectedNode.data.text]);

  const handleBlur = () => {
    if (!selectedNode || !chatbotFlow) return;

    const selectedNodeAltered: Node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        title,
        text,
      },
    };

    const updatedNodes = chatbotFlow.nodes.map((node) =>
      node.id === selectedNode.id ? selectedNodeAltered : node,
    );

    console.log('updatedNodes: ', updatedNodes);

    const { id, __typename, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
    };

    setChatbotFlowSelectedNode(selectedNodeAltered);
    updateFlow(updatedChatbotFlow);
  };

  return (
    <>
      <StyledHeader>
        <StyledHeaderInfo>
          <StyledHeaderTitle>
            <TitleInput
              sizeVariant="md"
              value={title as string}
              onChange={handleChange}
              onEscape={() => {
                setTitle(initialTitle);
              }}
            />
          </StyledHeaderTitle>
          <StyledHeaderType>
            {getChatbotNodeLabel(selectedNode.type ?? '')}
          </StyledHeaderType>
        </StyledHeaderInfo>
      </StyledHeader>
      <StyledStepBody>
        <StyledDiv>
          <Label>Message body</Label>
          <textarea
            id="text"
            ref={textareaRef}
            value={text}
            onChange={handleInputChange}
            disabled={text.length >= 4000}
            onBlur={handleBlur}
          />
          <StyledLabel>{text.length}/4000</StyledLabel>
        </StyledDiv>
      </StyledStepBody>
    </>
  );
};
