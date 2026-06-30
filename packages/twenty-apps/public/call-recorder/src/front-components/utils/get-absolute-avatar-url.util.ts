// Duplicates minimal front image URL logic for this app.
// Remove once shared front utilities can be imported safely in front components.
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type GetImageAbsoluteUrlArgs = {
  imageUrl: string;
  baseUrl: string;
};

const getImageAbsoluteUrl = ({
  imageUrl,
  baseUrl,
}: GetImageAbsoluteUrlArgs): string => {
  const lowerCaseImageUrl = imageUrl.toLowerCase();
  const isAlreadyAbsoluteUrl =
    ['http:', 'https:', 'data:', 'blob:'].some((scheme) =>
      lowerCaseImageUrl.startsWith(scheme),
    ) || imageUrl.startsWith('//');

  if (isAlreadyAbsoluteUrl) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return new URL(`/files${imageUrl}`, baseUrl).toString();
  }

  return new URL(`/files/${imageUrl}`, baseUrl).toString();
};

export const getAbsoluteAvatarUrl = (
  avatarUrl: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(avatarUrl)) {
    return undefined;
  }

  const apiBaseUrl = process.env.TWENTY_API_URL;

  if (!isNonEmptyString(apiBaseUrl)) {
    return avatarUrl.trim();
  }

  return getImageAbsoluteUrl({
    imageUrl: avatarUrl.trim(),
    baseUrl: apiBaseUrl,
  });
};
