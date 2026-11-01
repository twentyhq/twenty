import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { t } from '@lingui/core/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';

import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';

const ATTACHMENT_CHIP_MAX_WIDTH = 140;

type AttachmentChipProps = {
  file: { id: string; name: string };
  onRemove: () => void;
  readonly?: boolean;
};

export const AttachmentChip = ({
  file,
  onRemove,
  readonly = false,
}: AttachmentChipProps) => {
  const iconColors = useFileCategoryColors();
  const fileType = getFileType(file.name);

  const handleChipClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleRemoveClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <Chip
      variant="soft"
      clickable={false}
      maxWidth={ATTACHMENT_CHIP_MAX_WIDTH}
      onClick={handleChipClick}
      startElement={
        <AvatarOrIcon
          Icon={IconMapping[fileType]}
          IconBackgroundColor={iconColors[fileType]}
        />
      }
      endElement={
        !readonly && (
          <LightIconButton
            size="xs"
            emphasis="subtle"
            aria-label={t`Remove ${file.name}`}
            onClick={handleRemoveClick}
          >
            <IconX />
          </LightIconButton>
        )
      }
    >
      {file.name}
    </Chip>
  );
};
