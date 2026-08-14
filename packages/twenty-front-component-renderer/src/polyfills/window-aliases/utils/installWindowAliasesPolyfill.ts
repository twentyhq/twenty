import { installAnimationFrameWindowAliases } from '@/polyfills/window-aliases/utils/installAnimationFrameWindowAliases';
import { installCssNamespacePolyfill } from '@/polyfills/window-aliases/utils/installCssNamespacePolyfill';
import { installFetchWindowAlias } from '@/polyfills/window-aliases/utils/installFetchWindowAlias';
import { installIdleCallbackShim } from '@/polyfills/window-aliases/utils/installIdleCallbackShim';
import { installNativeWindowAliases } from '@/polyfills/window-aliases/utils/installNativeWindowAliases';

type InstallWindowAliasesPolyfillInput = {
  globalScope: Record<string, unknown>;
};

export const installWindowAliasesPolyfill = ({
  globalScope,
}: InstallWindowAliasesPolyfillInput): void => {
  installAnimationFrameWindowAliases(globalScope);
  installFetchWindowAlias(globalScope);
  installNativeWindowAliases(globalScope);
  installIdleCallbackShim(globalScope);
  installCssNamespacePolyfill(globalScope);
};
