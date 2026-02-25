import styled from '@emotion/styled';

import { type EmailThreadMessageAttachment } from '@/activities/emails/types/EmailThreadMessage';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { IconPaperclip } from 'twenty-ui/display';

const StyledAttachmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledAttachmentRow = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1, 2)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledAttachmentName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAttachmentSize = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  flex-shrink: 0;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

type EmailMessageAttachmentsProps = {
  attachments: EmailThreadMessageAttachment[];
};

export const EmailMessageAttachments = ({
  attachments,
}: EmailMessageAttachmentsProps) => {
  if (attachments.length === 0) {
    return null;
  }

  const handleDownload = (attachment: EmailThreadMessageAttachment) => {
    const downloadUrl = `${window.location.origin}/api/message-attachments/${attachment.id}/download`;

    downloadFile(downloadUrl, attachment.name);
  };

  return (
    <StyledAttachmentsContainer>
      {attachments.map((attachment) => (
        <StyledAttachmentRow
          key={attachment.id}
          onClick={() => handleDownload(attachment)}
        >
          <StyledIconContainer>
            <IconPaperclip size={14} />
          </StyledIconContainer>
          <StyledAttachmentName>{attachment.name}</StyledAttachmentName>
          {attachment.size !== null && (
            <StyledAttachmentSize>
              {formatFileSize(attachment.size)}
            </StyledAttachmentSize>
          )}
        </StyledAttachmentRow>
      ))}
    </StyledAttachmentsContainer>
  );
};
