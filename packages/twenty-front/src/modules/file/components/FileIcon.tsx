import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type FileCategory } from 'twenty-shared/types';

type FileIconSize = 'small' | 'medium';

const StyledIconContainer = styled.div<{
  background: string;
  size: FileIconSize;
}>`
  align-items: center;
  background: ${({ background }) => background};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.grayScale.gray1};
  display: flex;
  flex-shrink: 0;
  height: ${({ size }) => (size === 'small' ? '14px' : 'auto')};
  justify-content: center;
  padding: ${({ theme, size }) =>
    size === 'small' ? '0' : theme.spacing(1.25)};
  width: ${({ size }) => (size === 'small' ? '14px' : 'auto')};
`;

export const FileIcon = ({
  fileCategory,
  size = 'medium',
}: {
  fileCategory: AttachmentFileCategory | FileCategory;
  size?: FileIconSize;
}) => {
  const theme = useTheme();

  const iconColors = {
    ARCHIVE: theme.color.gray,
    AUDIO: theme.color.pink,
    IMAGE: theme.color.amber,
    PRESENTATION: theme.color.orange,
    SPREADSHEET: theme.color.turquoise,
    TEXT_DOCUMENT: theme.color.blue,
    VIDEO: theme.color.purple,
    OTHER: theme.color.gray,
  };

  const Icon = IconMapping[fileCategory];

  return (
    <StyledIconContainer
      background={iconColors[fileCategory] ?? theme.color.gray}
      size={size}
    >
      {Icon && <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />}
    </StyledIconContainer>
  );
};
