import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

const StyledIconContainer = styled.div<{ background: string }>`
  align-items: center;
  background: ${({ background }) => background};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.grayScale.gray1};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1.25)};
`;

export const FileIcon = ({
  fileCategory,
}: {
  fileCategory: AttachmentFileCategory;
}) => {
  const theme = useTheme();
  const iconColors = useFileCategoryColors();

  const Icon = IconMapping[fileCategory];

  return (
    <StyledIconContainer background={iconColors[fileCategory]}>
      {Icon && <Icon size={theme.icon.size.sm} />}
    </StyledIconContainer>
  );
};
