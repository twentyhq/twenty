import { isDefined } from 'twenty-shared/utils';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type NavigatorWithClipboard = {
  clipboard?: { writeText: (text: string) => Promise<void> };
};

type InstallClipboardPolyfillInput = {
  globalScope: Record<string, unknown>;
  copyToClipboard: (text: string) => Promise<void>;
};

// Libraries call the standard navigator.clipboard.writeText; the worker has
// no clipboard access, so the write is delegated to the host. Only writeText
// is polyfilled: reading the clipboard is not a capability the host grants.
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
