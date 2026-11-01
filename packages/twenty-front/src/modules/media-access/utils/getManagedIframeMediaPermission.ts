import { type ManagedIframeProps } from '@/media-access/types/ManagedIframeProps';
import { restrictIframeMediaPermission } from '@/media-access/utils/restrictIframeMediaPermission';
import { isNonEmptyString } from '@sniptt/guards';
import { type IframeMediaPermission } from 'twenty-shared/types';
import {
  getUrlSafely,
  isDefined,
  normalizeIframeOrigin,
} from 'twenty-shared/utils';

export const getManagedIframeMediaPermission = ({
  src,
  srcDoc,
  requestedMediaCapabilities = [],
  iframeMediaPermissions,
  hostOrigin,
}: Pick<
  ManagedIframeProps,
  'src' | 'srcDoc' | 'requestedMediaCapabilities' | 'iframeMediaPermissions'
> & { hostOrigin: string }): IframeMediaPermission | null => {
  if (!isNonEmptyString(src) || isDefined(srcDoc)) {
    return null;
  }

  const sourceUrl = getUrlSafely(src);

  if (!isDefined(sourceUrl)) {
    return null;
  }

  const origin = normalizeIframeOrigin(sourceUrl.origin, { isHttpsOnly: true });

  if (
    sourceUrl.protocol !== 'https:' ||
    !isDefined(origin) ||
    origin === hostOrigin ||
    isNonEmptyString(sourceUrl.username) ||
    isNonEmptyString(sourceUrl.password)
  ) {
    return null;
  }

  return restrictIframeMediaPermission({
    permission:
      iframeMediaPermissions.find((candidate) => candidate.origin === origin) ??
      null,
    capabilities: requestedMediaCapabilities,
  });
};
