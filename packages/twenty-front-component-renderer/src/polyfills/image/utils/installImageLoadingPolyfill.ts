import { isDefined } from 'twenty-shared/utils';

import { createImagePreloaderClass } from '@/polyfills/image/utils/createImagePreloaderClass';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type ImageLoadingHost } from '@/types/image/ImageLoadingHost';

type InstallImageLoadingPolyfillInput = Pick<
  ImageLoadingHost,
  'loadImage' | 'cancelImage'
> & {
  globalScope: Record<string, unknown>;
};

export const installImageLoadingPolyfill = ({
  globalScope,
  loadImage,
  cancelImage,
}: InstallImageLoadingPolyfillInput): void => {
  const ImagePreloader = createImagePreloaderClass({ loadImage, cancelImage });

  for (const target of resolveGlobalScopeInstallTargets(globalScope)) {
    if (!isDefined(target.Image)) {
      target.Image = ImagePreloader;
    }
  }
};
