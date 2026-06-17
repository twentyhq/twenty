import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { getFileType } from '@/activities/files/utils/getFileType';
import { useFileCategoryColors } from '@/file/hooks/useFileCategoryColors';
import { IconMapping } from '@/file/utils/fileIconMappings';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useContext } from 'react';
import { type ExtendedFileUIPart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { AvatarOrIcon, Chip, ChipVariant } from 'twenty-ui/components';
import { type IconComponent, IconX } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledClickableContainer = styled.div<{ clickable: boolean }>`
  cursor: ${({ clickable }: { clickable: boolean }) =>
    clickable ? 'pointer' : 'inherit'};
  display: inline-flex;
  min-width: 0;
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
  const { theme } = useContext(ThemeContext);
  const iconColors: Record<AttachmentFileCategory, string> =
    useFileCategoryColors();
  const setFilePreview = useSetAtomState(filePreviewState);

  const fileName =
    file instanceof File ? file.name : (file.filename ?? t`Unknown file`);

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
    <div onClick={(e) => e.stopPropagation()}>
      <AvatarOrIcon
        Icon={IconX}
        IconColor={theme.font.color.secondary}
        onClick={onRemove}
      />
    </div>
  ) : undefined;

  const hasRightDivider = isDefined(onRemove);
  const isClickable = isDefined(fileUrl) && isDefined(fileId);

  return (
    <StyledClickableContainer
      clickable={isClickable}
      onClick={isClickable ? handleClick : undefined}
    >
      <Chip
        label={fileName}
        emptyLabel={t`Untitled`}
        variant={ChipVariant.Static}
        clickable={isClickable}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
        rightComponentDivider={hasRightDivider}
      />
    </StyledClickableContainer>
  );
};
