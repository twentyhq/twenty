import { isUndefined } from '@sniptt/guards';

import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getVideoFileExtension = ({
  extension,
  label,
}: {
  extension: string | null;
  label: string | null;
}): string | undefined => {
  const labelParts = label?.split('.');
  const videoFileExtension =
    extension ??
    (isUndefined(labelParts) ? undefined : labelParts[labelParts.length - 1]);
  const normalizedVideoFileExtension = videoFileExtension
    ?.toLowerCase()
    .replace(/^\./, '');

  return isNonEmptyString(normalizedVideoFileExtension)
    ? normalizedVideoFileExtension
    : undefined;
};
