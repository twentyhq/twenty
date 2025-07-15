import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { agentChatSelectedFilesComponentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatUploadedFilesComponentState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React, { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPaperclip } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  File as FileDocument,
  useCreateFileMutation,
} from '~/generated-metadata/graphql';

const StyledFileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

export const AgentChatFileUpload = ({ agentId }: { agentId: string }) => {
  const coreClient = useApolloCoreClient();
  const [createFile] = useCreateFileMutation({ client: coreClient });
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] =
    useRecoilComponentStateV2(agentChatSelectedFilesComponentState, agentId);
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentStateV2(agentChatUploadedFilesComponentState, agentId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendFile = async (file: File) => {
    try {
      const result = await createFile({
        variables: {
          file,
        },
      });

      const uploadedFile = result?.data?.createFile;

      if (!isDefined(uploadedFile)) {
        throw new Error("Couldn't upload the file.");
      }
      setAgentChatSelectedFiles(
        agentChatSelectedFiles.filter((f) => f.name !== file.name),
      );
      return uploadedFile;
    } catch (error) {
      const fileName = file.name;
      enqueueErrorSnackBar({
        message: t`Failed to upload file: ${fileName}`,
      });
      return null;
    }
  };

  const uploadFiles = async (files: File[]) => {
    const uploadResults = await Promise.allSettled(
      files.map((file) => sendFile(file)),
    );

    const successfulUploads = uploadResults.reduce<FileDocument[]>(
      (acc, result) => {
        if (result.status === 'fulfilled' && isDefined(result.value)) {
          acc.push(result.value);
        }
        return acc;
      },
      [],
    );

    if (successfulUploads.length > 0) {
      setAgentChatUploadedFiles([
        ...agentChatUploadedFiles,
        ...successfulUploads,
      ]);
    }

    const failedCount = uploadResults.filter(
      (result) => result.status === 'rejected',
    ).length;
    if (failedCount > 0) {
      enqueueErrorSnackBar({
        message: t`${failedCount} file(s) failed to upload`,
      });
    }
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
