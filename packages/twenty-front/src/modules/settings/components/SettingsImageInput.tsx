import { useLingui } from '@lingui/react/macro';
import { CORE_PICTURE_MAX_FILE_SIZE_IN_MB } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { ImageInput, type ImageInputProps } from 'twenty-ui/components/input';

import { formatFileSize } from '@/file/utils/formatFileSize';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const SETTINGS_IMAGE_INPUT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
];

const SETTINGS_IMAGE_INPUT_MAX_SIZE = CORE_PICTURE_MAX_FILE_SIZE_IN_MB * 1024 * 1024;

type SettingsImageInputProps = Pick<
  ImageInputProps,
  | 'onFileSelect'
  | 'onRemove'
  | 'onAbort'
  | 'isUploading'
  | 'errorMessage'
  | 'disabled'
> & {
  picture: string | null | undefined;
};

export const SettingsImageInput = ({
  picture,
  onFileSelect,
  onRemove,
  onAbort,
  isUploading,
  errorMessage,
  disabled,
}: SettingsImageInputProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const maxSizeInMb = CORE_PICTURE_MAX_FILE_SIZE_IN_MB;

  const handleFileSelect = (file: File) => {
    if (!SETTINGS_IMAGE_INPUT_ACCEPTED_TYPES.includes(file.type)) {
      enqueueToast({
        status: 'error',
        children: t`This file isn't a PNG, JPEG or GIF`,
        description: t`Pick a square PNG, JPEG or GIF under ${maxSizeInMb} MB.`,
      });
      return;
    }

    if (file.size > SETTINGS_IMAGE_INPUT_MAX_SIZE) {
      const fileSize = formatFileSize(file.size);

      enqueueToast({
        status: 'error',
        children: t`This file is ${fileSize}`,
        description: t`Pick a square PNG, JPEG or GIF under ${maxSizeInMb} MB.`,
      });
      return;
    }

    onFileSelect?.(file);
  };

  return (
    <ImageInput
      onFileSelect={isDefined(onFileSelect) ? handleFileSelect : undefined}
      onRemove={onRemove}
      onAbort={onAbort}
      isUploading={isUploading}
      errorMessage={errorMessage}
      disabled={disabled}
      src={getAbsoluteImageUrl(picture)}
      accept={SETTINGS_IMAGE_INPUT_ACCEPTED_TYPES.join(', ')}
      uploadLabel={t`Upload`}
      removeLabel={t`Remove`}
      abortLabel={t`Abort`}
      helperText={t`We support your square PNGs, JPEGs and GIFs under 10MB`}
    />
  );
};
