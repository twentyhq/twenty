import { installAnimationFrameFallback } from '@/polyfills/window-aliases/utils/installAnimationFrameFallback';
import { installFetchWindowAlias } from '@/polyfills/window-aliases/utils/installFetchWindowAlias';
import { installNativeWindowAliases } from '@/polyfills/window-aliases/utils/installNativeWindowAliases';

type InstallWindowAliasesPolyfillInput = {
  globalScope: Record<string, unknown>;
};

export const installWindowAliasesPolyfill = ({
  globalScope,
}: InstallWindowAliasesPolyfillInput): void => {
  installAnimationFrameFallback(globalScope);
  installNativeWindowAliases(globalScope);
  installFetchWindowAlias(globalScope);
};
