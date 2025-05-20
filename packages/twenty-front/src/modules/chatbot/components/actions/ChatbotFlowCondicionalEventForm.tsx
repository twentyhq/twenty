import { LogicOption } from '@/chatbot/components/ui/LogicOption';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import {
  NewConditionalState,
  NewLogicNodeData,
} from '@/chatbot/types/LogicNodeDataType';
import { getChatbotNodeLabel } from '@/chatbot/utils/getChatbotNodeLabel';
import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';
import { Node } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconPlus, Label } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type ChatbotFlowCondicionalEventFormProps = {
  selectedNode: Node;
};

const initialState: NewConditionalState = {
  logicNodes: [],
  logicNodeData: [],
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

export const ChatbotFlowCondicionalEventForm = ({
  selectedNode,
}: ChatbotFlowCondicionalEventFormProps) => {
  const initialTitle = (selectedNode.data.title as string) ?? 'Node title';
  const initialText =
    (selectedNode.data?.text as string) ?? 'Insert text to be sent';

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState<string>(initialText);
  const [nodeData, setNodeData] = useState<NewConditionalState>(initialState);

  const { updateFlow } = useUpdateChatbotFlow();

  const chatbotFlow = useRecoilValue(chatbotFlowState);
  const setChatbotFlow = useSetRecoilState(chatbotFlowState);
  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (selectedNode.data.logic) {
      setNodeData(selectedNode.data.logic);
    }
  }, [selectedNode.data.logic]);

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (textareaRef.current) {
      textareaRef.current.style.height = '30px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [selectedNode.data.text]);

  useEffect(() => {
    if (!selectedNode.data.logic) {
      addCondition();
    }
  }, [selectedNode.data.logic]);

  const handleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleInputChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = evt.target;
    const inputValue = textarea.value;

    if (inputValue.length > 4000) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;

    setText(inputValue);
  };

  const persistNode = (updatedLogic?: NewConditionalState) => {
    if (!chatbotFlow) return;

    const updatedNode: Node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        title,
        text,
        logic: updatedLogic ?? nodeData,
      },
    };

    const updatedNodes = chatbotFlow.nodes.map((n) =>
      n.id === selectedNode.id ? updatedNode : n,
    );

    const { id, __typename, workspace, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setChatbotFlowSelectedNode(updatedNode);
    updateFlow(updatedChatbotFlow);
    setChatbotFlow(updatedChatbotFlow);
  };

  const handleTitleBlur = () => persistNode();
  const handleTextBlur = () => persistNode();

  const addCondition = () => {
    const newIndex = nodeData.logicNodes.length;

    const newCondition: NewLogicNodeData = {
      option: `${newIndex + 1}`,
      comparison: '==',
      sectorId: '',
      conditionValue: '||',
    };

    const updated = {
      logicNodes: [...nodeData.logicNodes, newIndex],
      logicNodeData: [...nodeData.logicNodeData, newCondition],
    };

    setNodeData(updated);
    persistNode(updated);
  };

  const updateCondition = (index: number, updates: NewLogicNodeData) => {
    const newData = [...nodeData.logicNodeData];
    newData[index] = updates;

    const updated = { ...nodeData, logicNodeData: newData };

    setNodeData(updated);
    persistNode(updated);
  };

  const deleteCondition = (index: number) => {
    if (nodeData.logicNodes.length <= 1) return;

    const newNodes = nodeData.logicNodes.filter((_, i) => i !== index);
    const newData = nodeData.logicNodeData
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, option: `${i + 1}` }));

    const updated = { logicNodes: newNodes, logicNodeData: newData };

    setNodeData(updated);
    persistNode(updated);
  };

  return (
    <>
      <StyledHeader>
        <StyledHeaderInfo>
          <StyledHeaderTitle>
            <TitleInput
              sizeVariant="md"
              value={title}
              onChange={handleChange}
              onEscape={() => {
                setTitle(initialTitle);
              }}
              onClickOutside={handleTitleBlur}
            />
          </StyledHeaderTitle>
          <StyledHeaderType>
            Operator · {getChatbotNodeLabel(selectedNode.type ?? '')}
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
            onBlur={handleTextBlur}
          />
          <StyledLabel>{text.length}/4000</StyledLabel>
        </StyledDiv>
        <StyledDiv>
          {nodeData.logicNodes.map((_, index) => {
            return (
              <LogicOption
                key={index}
                nodeIndex={index}
                condition={nodeData.logicNodeData[index]}
                onDelete={() => deleteCondition(index)}
                onUpdate={(updates) => updateCondition(index, updates)}
                showDeleteButton={nodeData.logicNodes.length > 1}
              />
            );
          })}
        </StyledDiv>

        <Button
          onClick={addCondition}
          title={'Add option'}
          Icon={IconPlus}
          justify="center"
        />
      </StyledStepBody>
    </>
  );
};
