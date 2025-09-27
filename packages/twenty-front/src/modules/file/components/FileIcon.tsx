import { type AttachmentType } from '@/activities/files/types/Attachment';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { useAttachmentTypeColors } from '@/file/utils/getAttachmentTypeColors';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledIconContainer = styled.div<{ background: string }>`
  align-items: center;
  background: ${({ background }) => background};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.grayScale.gray0};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1.25)};
`;

export const FileIcon = ({ fileType }: { fileType: AttachmentType }) => {
  const theme = useTheme();
  const attachmentTypeColors = useAttachmentTypeColors();

  const Icon = IconMapping[fileType];

  return (
    <StyledIconContainer
      background={theme.color[attachmentTypeColors[fileType]]}
    >
      {Icon && <Icon size={theme.icon.size.sm} />}
    </StyledIconContainer>
  );
};
