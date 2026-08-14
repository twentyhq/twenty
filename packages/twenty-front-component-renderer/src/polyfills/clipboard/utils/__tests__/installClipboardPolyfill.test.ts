import { installClipboardPolyfill } from '@/polyfills/clipboard/utils/installClipboardPolyfill';

describe('installClipboardPolyfill', () => {
  it('should delegate writeText to the host copyToClipboard', async () => {
    const copyToClipboard = jest.fn().mockResolvedValue(undefined);
    const targetNavigator = {} as { clipboard?: { writeText: (text: string) => Promise<void> } };
    const globalScope: Record<string, unknown> = { navigator: targetNavigator };

    installClipboardPolyfill({ globalScope, copyToClipboard });

    await targetNavigator.clipboard?.writeText('copied text');

    expect(copyToClipboard).toHaveBeenCalledWith('copied text');
  });

  it('should leave an existing clipboard implementation in place', () => {
    const nativeClipboard = { writeText: jest.fn() };
    const globalScope: Record<string, unknown> = {
      navigator: { clipboard: nativeClipboard },
    };

    installClipboardPolyfill({
      globalScope,
      copyToClipboard: jest.fn(),
    });

    expect(
      (globalScope.navigator as { clipboard: unknown }).clipboard,
    ).toBe(nativeClipboard);
  });

  it('should install a navigator on the polyfill window when it has none', async () => {
    const copyToClipboard = jest.fn().mockResolvedValue(undefined);
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installClipboardPolyfill({ globalScope, copyToClipboard });

    const installedNavigator = polyfillWindow.navigator as {
      clipboard: { writeText: (text: string) => Promise<void> };
    };

    await installedNavigator.clipboard.writeText('from the window');

    expect(copyToClipboard).toHaveBeenCalledWith('from the window');
  });
});
