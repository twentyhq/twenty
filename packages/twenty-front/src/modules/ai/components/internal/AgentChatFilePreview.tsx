import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { type FileUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { AvatarChip, Chip, ChipVariant, LinkChip } from 'twenty-ui/components';
import { type IconComponent, IconX } from 'twenty-ui/display';
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
  const iconColors: Record<AttachmentFileCategory, string> =
    useFileCategoryColors();

  const fileName =
    file instanceof File ? file.name : (file.filename ?? t`Unknown file`);

  const fileUrl = file instanceof File ? undefined : file.url;

  const fileCategory: AttachmentFileCategory = getFileType(fileName);

  const FileCategoryIcon: IconComponent = IconMapping[fileCategory];
  const iconBackgroundColor: string = iconColors[fileCategory];

  const leftComponent = isUploading ? (
    <Loader color="yellow" />
  ) : (
    <AvatarChip
      Icon={FileCategoryIcon}
      IconBackgroundColor={iconBackgroundColor}
    />
  );

  const rightComponent = onRemove ? (
    <AvatarChip
      Icon={IconX}
      IconColor={theme.font.color.secondary}
      onClick={onRemove}
      divider="left"
    />
  ) : undefined;

  if (isDefined(fileUrl)) {
    return (
      <LinkChip
        label={fileName}
        emptyLabel={t`Untitled`}
        variant={ChipVariant.Static}
        to={fileUrl}
        target="_blank"
        leftComponent={leftComponent}
        rightComponent={rightComponent}
      />
    );
  }

  return (
    <Chip
      label={fileName}
      emptyLabel={t`Untitled`}
      variant={ChipVariant.Static}
      clickable={false}
      leftComponent={leftComponent}
      rightComponent={rightComponent}
    />
  );
};
