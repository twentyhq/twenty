import { getFileType } from '@/activities/files/utils/getFileType';
import { IconMapping, useFileTypeColors } from '@/file/utils/fileIconMappings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { File as FileDocument } from '~/generated-metadata/graphql';
import { AvatarChip, ChipVariant } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/display';

const StyledRemoveIconContainer = styled.div`
  display: flex;
  border-left: 1px solid ${({ theme }) => theme.border.color.light};

  svg {
    cursor: pointer;
  }
`;

export const AgentChatFilePreview = ({
  file,
  onRemove,
  isUploading,
}: {
  file: File | FileDocument;
  onRemove?: () => void;
  isUploading?: boolean;
}) => {
  const theme = useTheme();
  const iconColors = useFileTypeColors();

  return (
    <AvatarChip
      name={file.name}
      LeftIcon={IconMapping[getFileType(file.name)]}
      LeftIconBackgroundColor={iconColors[getFileType(file.name)]}
      variant={ChipVariant.Static}
      rightComponent={
        onRemove ? (
          <StyledRemoveIconContainer>
            <IconX
              size={theme.icon.size.sm}
              color={theme.font.color.secondary}
              onClick={onRemove}
            />
          </StyledRemoveIconContainer>
        ) : undefined
      }
    />
  );
};
