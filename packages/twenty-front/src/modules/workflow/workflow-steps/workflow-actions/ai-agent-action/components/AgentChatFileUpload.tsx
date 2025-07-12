import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { UPLOAD_AGENT_CHAT_FILE } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/api/agent-chat-apollo.api';
import { agentChatSelectedFilesState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesState';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React, { useRef } from 'react';
import { useRecoilState } from 'recoil';
import { IconPaperclip } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledFileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

export const AgentChatFileUpload = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const apolloClient = useApolloClient();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useRecoilState(
    agentChatSelectedFilesState,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilState(
    agentChatUploadedFilesState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendFile = async (file: File) => {
    try {
      const response = await apolloClient.mutate({
        mutation: UPLOAD_AGENT_CHAT_FILE,
        variables: {
          file,
        },
      });

      return response.data.uploadAgentChatFile;
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Failed to upload file`,
      });
    } finally {
      setAgentChatSelectedFiles(
        agentChatSelectedFiles.filter((f) => f.name !== file.name),
      );
    }
  };

  const uploadFiles = async (files: File[]) => {
    const uploadedFiles = await Promise.all(
      files.map((file) => sendFile(file)),
    );

    setAgentChatUploadedFiles([...agentChatUploadedFiles, ...uploadedFiles]);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) {
      return;
    }

    uploadFiles(Array.from(event.target.files));
    setAgentChatSelectedFiles(Array.from(event.target.files));
  };

  return (
    <StyledFileUploadContainer>
      <StyledFileInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={handleFileInputChange}
      />

      <Button
        variant="secondary"
        size="small"
        onClick={handleFileButtonClick}
        Icon={IconPaperclip}
      />
    </StyledFileUploadContainer>
  );
};
