import { getFileType } from '@/activities/files/utils/getFileType';
import { IconMapping, useFileTypeColors } from '@/file/utils/fileIconMappings';
import { useTheme } from '@emotion/react';
import { File as FileDocument } from '~/generated-metadata/graphql';
import { Chip, ChipVariant, AvatarChip } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';

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
    <Chip
      label={file.name}
      variant={ChipVariant.Static}
      leftComponent={
        isUploading ? (
          <Loader color="yellow" />
        ) : (
          <AvatarChip
            Icon={IconMapping[getFileType(file.name)]}
            IconBackgroundColor={iconColors[getFileType(file.name)]}
          />
        )
      }
      rightComponent={
        onRemove ? (
          <AvatarChip
            Icon={IconX}
            IconColor={theme.font.color.secondary}
            onClick={onRemove}
            divider={'left'}
          />
        ) : undefined
      }
    />
  );
};
