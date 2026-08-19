import { styled } from '@linaria/react';
import { type EmailAttachment } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AttachmentChip } from '@/file/components/AttachmentChip';

type EmailAttachmentsFieldProps = {
  files: EmailAttachment[];
  onChange: (files: EmailAttachment[]) => void;
};

const StyledChipsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

export const EmailAttachmentsField = ({
  files,
  onChange,
}: EmailAttachmentsFieldProps) => {
  const handleRemoveFile = (fileId: string) => {
    onChange(files.filter((file) => file.id !== fileId));
  };

  return (
    <StyledChipsContainer>
      {files.map((file) => (
        <AttachmentChip
          key={file.id}
          file={file}
          onRemove={() => handleRemoveFile(file.id)}
        />
      ))}
    </StyledChipsContainer>
  );
};
