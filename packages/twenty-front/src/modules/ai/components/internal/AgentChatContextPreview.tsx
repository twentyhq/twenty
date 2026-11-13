import { InboxFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { inboxSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { inboxUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const AgentChatContextPreview = () => {
  const [inboxSelectedFiles, setInboxSelectedFiles] = useAtomState(
    inboxSelectedFilesState,
  );
  const [inboxUploadedFiles, setInboxUploadedFiles] = useAtomState(
    inboxUploadedFilesState,
  );

  const handleRemoveUploadedFile = (fileIndex: number) => {
    setInboxUploadedFiles(
      inboxUploadedFiles.filter((_, index) => fileIndex !== index),
    );
  };

  const hasFiles =
    inboxSelectedFiles.length > 0 || inboxUploadedFiles.length > 0;

  if (!hasFiles) {
    return null;
  }

  return (
    <StyledPreviewsContainer>
      {inboxSelectedFiles.map((file, index) => (
        <InboxFilePreview
          file={file}
          key={`${index}-${file.name}`}
          onRemove={() => {
            setInboxSelectedFiles(
              inboxSelectedFiles.filter(
                (selectedFile) => selectedFile !== file,
              ),
            );
          }}
          isUploading
        />
      ))}
      {inboxUploadedFiles.map((file, index) => (
        <InboxFilePreview
          file={file}
          key={index}
          onRemove={() => handleRemoveUploadedFile(index)}
          isUploading={false}
        />
      ))}
    </StyledPreviewsContainer>
  );
};
