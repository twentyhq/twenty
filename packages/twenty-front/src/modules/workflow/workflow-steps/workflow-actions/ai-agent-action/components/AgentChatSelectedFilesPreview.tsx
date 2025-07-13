import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { AgentChatFilePreview } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/AgentChatFilePreview';
import { agentChatSelectedFilesComponentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesComponentState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useDeleteFileMutation } from '~/generated-metadata/graphql';

const StyledPreviewContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const AgentChatSelectedFilesPreview = ({
  agentId,
}: {
  agentId: string;
}) => {
  const { t } = useLingui();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] =
    useRecoilComponentStateV2(agentChatSelectedFilesComponentState, agentId);
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentStateV2(agentChatUploadedFilesComponentState, agentId);

  const { enqueueErrorSnackBar } = useSnackBar();

  const [deleteFile] = useDeleteFileMutation();

  const handleRemoveUploadedFile = async (fileId: string) => {
    const originalFiles = agentChatUploadedFiles;

    setAgentChatUploadedFiles(
      agentChatUploadedFiles.filter((f) => f.id !== fileId),
    );

    try {
      await deleteFile({ variables: { fileId } });
    } catch (error) {
      setAgentChatUploadedFiles(originalFiles);
      enqueueErrorSnackBar({
        message: t`Failed to remove file`,
      });
    }
  };

  return [...agentChatSelectedFiles, ...agentChatUploadedFiles].length > 0 ? (
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
  ) : null;
};
