import styled from '@emotion/styled';

import { type Attachment } from '@/activities/files/types/Attachment';
import { FileIcon } from '@/file/components/FileIcon';
import { IconX, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledImageThumbnail = styled.div<{ thumbnailUrl: string }>`
  width: 100%;
  aspect-ratio: 1;
  background-image: url(${({ thumbnailUrl }) => thumbnailUrl});
  background-size: cover;
  background-position: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  position: relative;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const StyledFileThumbnail = styled.div`
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.secondary};
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledRemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.2s;

  &:hover {
    background: ${({ theme }) => theme.background.danger};
    border-color: ${({ theme }) => theme.color.red};
    color: ${({ theme }) => theme.font.color.inverted};
  }
`;

const StyledFileName = styled.div`
  margin-top: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  text-align: center;
  width: 100%;
`;

type AttachmentGridProps = {
  attachments: Attachment[];
  onRemove?: (attachmentId: string) => void;
  onPreview?: (attachment: Attachment) => void;
};

export const AttachmentGrid = ({
  attachments,
  onRemove,
  onPreview,
}: AttachmentGridProps) => {
  const handleRemove = (e: React.MouseEvent, attachmentId: string) => {
    e.stopPropagation();
    onRemove?.(attachmentId);
  };

  const handlePreview = (attachment: Attachment) => {
    onPreview?.(attachment);
  };

  const isImageFile = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  return (
    <StyledGrid>
      {attachments.map((attachment) => {
        const { name: fileName } = getFileNameAndExtension(attachment.name);
        const isImage = isImageFile(attachment.type);

        if (isImage) {
          return (
            <div key={attachment.id}>
            <StyledImageThumbnail
                thumbnailUrl={attachment.fullPath}
                onClick={() => handlePreview(attachment)}
              >
                {onRemove && (
                  <StyledRemoveButton
                    onClick={(e) => handleRemove(e, attachment.id)}
                    style={{ opacity: 1 }}
                  >
                    <IconX size={12} />
                  </StyledRemoveButton>
                )}
              </StyledImageThumbnail>
              <StyledFileName>
                <OverflowingTextWithTooltip text={fileName} />
              </StyledFileName>
            </div>
          );
        }

        return (
          <div key={attachment.id}>
            <StyledFileThumbnail onClick={() => handlePreview(attachment)}>
              <FileIcon fileType={attachment.type} />
              {onRemove && (
                <StyledRemoveButton
                  onClick={(e) => handleRemove(e, attachment.id)}
                  style={{ opacity: 1 }}
                >
                  <IconX size={12} />
                </StyledRemoveButton>
              )}
            </StyledFileThumbnail>
            <StyledFileName>
              <OverflowingTextWithTooltip text={fileName} />
            </StyledFileName>
          </div>
        );
      })}
    </StyledGrid>
  );
};

