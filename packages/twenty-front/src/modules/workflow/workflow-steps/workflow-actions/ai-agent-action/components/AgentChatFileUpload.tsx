import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { UPLOAD_AGENT_CHAT_FILE } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/api/agent-chat-apollo.api';
import { agentChatSelectedFilesComponentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesComponentState';
import { useApolloClient } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React, { useRef } from 'react';
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

export const AgentChatFileUpload = ({ agentId }: { agentId: string }) => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const apolloClient = useApolloClient();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] =
    useRecoilComponentStateV2(agentChatSelectedFilesComponentState, agentId);
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentStateV2(agentChatUploadedFilesComponentState, agentId);
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
        onClick={() => {
          fileInputRef.current?.click();
        }}
        Icon={IconPaperclip}
      />
    </StyledFileUploadContainer>
  );
};
