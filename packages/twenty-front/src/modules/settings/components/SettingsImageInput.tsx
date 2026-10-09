import { useLingui } from '@lingui/react/macro';
import { ImageInput, type ImageInputProps } from 'twenty-ui/components/input';

import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsImageInputProps = Pick<
  ImageInputProps,
  | 'onUpload'
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
  onUpload,
  onRemove,
  onAbort,
  isUploading,
  errorMessage,
  disabled,
}: SettingsImageInputProps) => {
  const { t } = useLingui();

  return (
    <ImageInput
      onUpload={onUpload}
      onRemove={onRemove}
      onAbort={onAbort}
      isUploading={isUploading}
      errorMessage={errorMessage}
      disabled={disabled}
      src={getAbsoluteImageUrl(picture)}
      accept="image/jpeg, image/png, image/gif"
      uploadLabel={t`Upload`}
      removeLabel={t`Remove`}
      abortLabel={t`Abort`}
      helperText={t`We support your square PNGs, JPEGs and GIFs under 10MB`}
    />
  );
};
