import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { type ExtendedFileUIPart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { Loader } from 'twenty-ui/primitives/feedback';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledPreviewButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  min-width: 0;
  padding: 0;
  vertical-align: middle;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -1px;
  }

  &:disabled {
    cursor: inherit;
  }
`;

export const AgentChatFilePreview = ({
  file,
  onRemove,
  isUploading,
}: {
  file: ExtendedFileUIPart | File;
  onRemove?: () => void;
  isUploading?: boolean;
}) => {
  const theme = useTheme();
  const iconColors: Record<AttachmentFileCategory, string> =
    useFileCategoryColors();
  const setFilePreview = useSetAtomState(filePreviewState);

  const fileName =
    file instanceof File ? file.name : (file.filename ?? t`Unknown file`);

  const { text: displayName, content } = getChipLabel(fileName);

  const fileUrl = file instanceof File ? undefined : file.url;
  const fileId = file instanceof File ? undefined : file.fileId;

  const fileCategory: AttachmentFileCategory = getFileType(fileName);
  const extension = fileName.split('.').pop() ?? '';

  const FileCategoryIcon: IconComponent = IconMapping[fileCategory];
  const iconBackgroundColor: string = iconColors[fileCategory];

  const handleClick = useCallback(() => {
    if (!isDefined(fileUrl) || !isDefined(fileId)) {
      return;
    }

    setFilePreview({
      fileId,
      label: fileName,
      extension,
      url: fileUrl,
      fileCategory: getFileCategoryFromExtension(extension),
    });
  }, [fileUrl, fileId, fileName, extension, setFilePreview]);

  const leftComponent = isUploading ? (
    <Loader color="yellow" />
  ) : (
    <AvatarOrIcon
      Icon={FileCategoryIcon}
      IconBackgroundColor={iconBackgroundColor}
    />
  );

  const rightComponent = onRemove ? (
    <div onClick={(event) => event.stopPropagation()}>
      <AvatarOrIcon
        Icon={IconX}
        name={t`Remove ${displayName}`}
        IconColor={theme.font.color.secondary}
        onClick={onRemove}
      />
    </div>
  ) : undefined;

  const hasRightDivider = isDefined(onRemove);
  const isClickable = isDefined(fileUrl) && isDefined(fileId);

  return (
    <Chip
      variant="soft"
      startElement={
        <StyledPreviewButton
          type="button"
          disabled={!isClickable}
          onClick={handleClick}
        >
          {leftComponent}
          <OverflowingTextWithTooltip
            render={<span />}
            text={content}
            tooltipContent={displayName}
            style={{ minWidth: 0 }}
          />
        </StyledPreviewButton>
      }
      endElement={rightComponent}
      endElementDivider={hasRightDivider}
    />
  );
};
