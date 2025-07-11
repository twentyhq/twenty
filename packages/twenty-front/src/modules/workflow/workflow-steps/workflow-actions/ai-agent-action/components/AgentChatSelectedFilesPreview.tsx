import { AgentChatFilePreview } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/AgentChatFilePreview';
import { agentChatSelectedFilesState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesState';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

const StyledPreviewContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const AgentChatSelectedFilesPreview = () => {
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useRecoilState(
    agentChatSelectedFilesState,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilState(
    agentChatUploadedFilesState,
  );

  return (
    <StyledPreviewContainer>
      {agentChatSelectedFiles.map((file) => (
        <AgentChatFilePreview
          file={file}
          key={file.name}
          onRemove={() => {
            setAgentChatSelectedFiles(
              agentChatSelectedFiles.filter((f) => f.name !== file.name),
            );
          }}
          isUploading
        />
      ))}
      {agentChatUploadedFiles.map((file) => (
        <AgentChatFilePreview
          file={file}
          onRemove={() => {
            setAgentChatUploadedFiles(
              agentChatUploadedFiles.filter((f) => f.name !== file.name),
            );
          }}
          isUploading={false}
        />
      ))}
    </StyledPreviewContainer>
  );
};
