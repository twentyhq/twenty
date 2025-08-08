import { AttachmentType } from '@/activities/files/types/Attachment';
import { IconMapping, useFileTypeColors } from '@/file/utils/fileIconMappings';
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
  const iconColors = useFileTypeColors();

  const Icon = IconMapping[fileType];

  return (
    <StyledIconContainer background={iconColors[fileType]}>
      {Icon && <Icon size={theme.icon.size.sm} />}
    </StyledIconContainer>
  );
};
