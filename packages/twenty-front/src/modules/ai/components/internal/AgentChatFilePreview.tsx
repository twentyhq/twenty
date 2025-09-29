import { getFileType } from '@/activities/files/utils/getFileType';
import { IconMapping, useFileTypeColors } from '@/file/utils/fileIconMappings';
import { useTheme } from '@emotion/react';
import { type FileUIPart } from 'ai';
import { AvatarChip, Chip, ChipVariant } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';

export const AgentChatFilePreview = ({
  file,
  onRemove,
  isUploading,
}: {
  file: FileUIPart | File;
  onRemove?: () => void;
  isUploading?: boolean;
}) => {
  const theme = useTheme();
  const iconColors = useFileTypeColors();

  const fileName =
    file instanceof File ? file.name : (file.filename ?? 'Unknown file');

  return (
    <Chip
      label={fileName}
      variant={ChipVariant.Static}
      leftComponent={
        isUploading ? (
          <Loader color="yellow" />
        ) : (
          <AvatarChip
            Icon={IconMapping[getFileType(fileName)]}
            IconBackgroundColor={iconColors[getFileType(fileName)]}
          />
        )
      }
      rightComponent={
        onRemove ? (
          <AvatarChip
            Icon={IconX}
            IconColor={theme.font.color.secondary}
            onClick={onRemove}
            divider="left"
          />
        ) : undefined
      }
    />
  );
};
