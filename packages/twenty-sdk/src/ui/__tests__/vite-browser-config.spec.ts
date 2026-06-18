import { type UserConfig } from 'vite';

import browserViteConfig from '../../../vite.config.browser';

type ViteConfigFunction = (environment: {
  command: 'build';
  mode: string;
  isSsrBuild: boolean;
  isPreview: boolean;
}) => UserConfig | Promise<UserConfig>;

type RollupExternalFunction = (
  source: string,
  importer?: string,
  isResolved?: boolean,
) => boolean | null | void;

const resolveBrowserViteConfig = async (): Promise<UserConfig> => {
  if (typeof browserViteConfig === 'function') {
    return (browserViteConfig as ViteConfigFunction)({
      command: 'build',
      mode: 'production',
      isSsrBuild: false,
      isPreview: false,
    });
  }

  return browserViteConfig;
};

describe('vite browser config', () => {
  it('keeps twenty-ui external in the SDK UI entry', async () => {
    const resolvedBrowserViteConfig = await resolveBrowserViteConfig();
    const external = resolvedBrowserViteConfig.build?.rollupOptions?.external;

    expect(typeof external).toBe('function');

    const isExternal = external as RollupExternalFunction;

    expect(isExternal('twenty-ui')).toBe(true);
    expect(isExternal('twenty-ui/feedback')).toBe(true);
    expect(isExternal('twenty-ui/theme-constants')).toBe(true);
  });
});
