import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
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
  const iconColors = useFileCategoryColors();

  const fileName =
    file instanceof File ? file.name : (file.filename ?? 'Unknown file');

  const fileCategory = getFileType(fileName);

  return (
    <Chip
      label={fileName}
      variant={ChipVariant.Static}
      leftComponent={
        isUploading ? (
          <Loader color="yellow" />
        ) : (
          <AvatarChip
            Icon={IconMapping[fileCategory]}
            IconBackgroundColor={iconColors[fileCategory]}
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
