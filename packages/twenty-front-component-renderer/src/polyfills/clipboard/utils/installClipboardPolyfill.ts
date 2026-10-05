import { isDefined } from 'twenty-shared/utils';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type NavigatorWithClipboard = {
  clipboard?: { writeText: (text: string) => Promise<void> };
};

type InstallClipboardPolyfillInput = {
  globalScope: Record<string, unknown>;
  copyToClipboard: (text: string) => Promise<void>;
};

// The worker has no clipboard, so writeText is delegated to the host; reading is not a granted capability.
export const installClipboardPolyfill = ({
  globalScope,
  copyToClipboard,
}: InstallClipboardPolyfillInput): void => {
  const clipboard = {
    writeText: (text: string): Promise<void> => copyToClipboard(String(text)),
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    const targetNavigator = (installTarget.navigator ??
      globalScope.navigator) as NavigatorWithClipboard | undefined;

    if (!isDefined(targetNavigator)) {
      installTarget.navigator = { clipboard };
      continue;
    }

    installTarget.navigator ??= targetNavigator;

    // A native worker clipboard, if a browser ever ships one, wins.
    if (!isDefined(targetNavigator.clipboard)) {
      Object.defineProperty(targetNavigator, 'clipboard', {
        configurable: true,
        value: clipboard,
      });
    }
  }
};
