import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { useUpdateChatbotFlow } from '@/chatbot/hooks/useUpdateChatbotFlow';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { chatbotFlowState } from '@/chatbot/state/chatbotFlowState';
import { getChatbotNodeLabel } from '@/chatbot/utils/getChatbotNodeLabel';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { TitleInput } from '@/ui/input/components/TitleInput';
import styled from '@emotion/styled';
import { Node } from '@xyflow/react';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Label } from 'twenty-ui/display';

type ChatbotFlowImageEventFormProps = {
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

export const ChatbotFlowImageEventForm = ({
  selectedNode,
}: ChatbotFlowImageEventFormProps) => {
  const initialTitle = (selectedNode.data.title as string) ?? 'Node title';
  const initialImage = selectedNode.data?.imageUrl as string | undefined;

  const [title, setTitle] = useState(initialTitle);
  const [image, setImage] = useState<string | undefined>(initialImage);

  const { updateFlow } = useUpdateChatbotFlow();
  const { uploadFileToBucket } = useUploadFileToBucket();

  const chatbotFlow = useRecoilValue(chatbotFlowState);
  const setChatbotFlowSelectedNode = useSetRecoilState(
    chatbotFlowSelectedNodeState,
  );

  const handleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleFieldBlur = (field: 'title', value: string) => {
    if (!selectedNode || !chatbotFlow) return;

    const updatedNode: Node = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    };

    const updatedNodes = chatbotFlow.nodes.map((node) =>
      node.id === selectedNode.id ? updatedNode : node,
    );

    // @ts-expect-error 'id', '__typename' and 'workspace' don't exist in 'chatbotFlow'.
    // TODO: Build a type using Omit<...> instead.
    const { id, __typename, workspace, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setChatbotFlowSelectedNode(updatedNode);
    updateFlow(updatedChatbotFlow);
  };

  const handleSendFile = async (file: File) => {
    if (!selectedNode || !chatbotFlow) return;

    setImage(undefined);

    const url = await uploadFileToBucket({ file, type: 'image' });

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (url && selectedNode) {
      setImage(url);

      const updatedNode = {
        ...selectedNode,
        data: {
          ...selectedNode.data,
          imageUrl: url,
        },
      };

      const updatedNodes = chatbotFlow.nodes.map((node) =>
        node.id === selectedNode.id ? updatedNode : node,
      );

      // @ts-expect-error 'id', '__typename' and 'workspace' don't exist in 'chatbotFlow'.
      // TODO: Build a type using Omit<...> instead.
      const { id, __typename, workspace, ...chatbotFlowWithoutId } =
        chatbotFlow;

      const updatedChatbotFlow = {
        ...chatbotFlowWithoutId,
        nodes: updatedNodes,
        viewport: { x: 0, y: 0, zoom: 0 },
      };

      setChatbotFlowSelectedNode(updatedNode);
      updateFlow(updatedChatbotFlow);
    }
  };

  const handleRemoveFile = () => {
    if (!selectedNode || !chatbotFlow) return;

    setImage(undefined);

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        imageUrl: '',
      },
    };

    const updatedNodes = chatbotFlow.nodes.map((node) =>
      node.id === selectedNode.id ? updatedNode : node,
    );

    // @ts-expect-error 'id', '__typename' and 'workspace' don't exist in 'chatbotFlow'.
    // TODO: Build a type using Omit<...> instead.
    const { id, __typename, workspace, ...chatbotFlowWithoutId } = chatbotFlow;

    const updatedChatbotFlow = {
      ...chatbotFlowWithoutId,
      nodes: updatedNodes,
      viewport: { x: 0, y: 0, zoom: 0 },
    };

    setChatbotFlowSelectedNode(updatedNode);
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
              onClickOutside={() => handleFieldBlur('title', title)}
            />
          </StyledHeaderTitle>
          <StyledHeaderType>
            {getChatbotNodeLabel(selectedNode.type ?? '')}
          </StyledHeaderType>
        </StyledHeaderInfo>
      </StyledHeader>
      <StyledStepBody>
        <StyledDiv>
          <Label>File</Label>
          <ImageInput
            picture={image}
            onUpload={handleSendFile}
            onRemove={handleRemoveFile}
            maxSize="5"
          />
        </StyledDiv>
      </StyledStepBody>
    </>
  );
};
