import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DELETE_AGENT_CHAT_FILE } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/api/agent-chat-apollo.api';
import { AgentChatFilePreview } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/AgentChatFilePreview';
import { agentChatSelectedFilesState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesState';
import { useMutation } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useRecoilState(
    agentChatSelectedFilesState,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilState(
    agentChatUploadedFilesState,
  );

  const { enqueueErrorSnackBar } = useSnackBar();

  const [deleteFile] = useMutation(DELETE_AGENT_CHAT_FILE);

  const handleRemoveUploadedFile = async (fileId: string) => {
    const originalFiles = agentChatUploadedFiles;

    setAgentChatUploadedFiles(
      agentChatUploadedFiles.filter((f) => f.id !== fileId),
    );

    deleteFile({ variables: { fileId } }).catch(() => {
      setAgentChatUploadedFiles(originalFiles);
      enqueueErrorSnackBar({
        message: t`Failed to remove file`,
      });
    });
  };

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
          key={file.id}
          onRemove={() => handleRemoveUploadedFile(file.id)}
          isUploading={false}
        />
      ))}
    </StyledPreviewContainer>
  );
};
