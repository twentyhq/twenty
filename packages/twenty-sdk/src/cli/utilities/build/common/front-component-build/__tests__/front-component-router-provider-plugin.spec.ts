import * as esbuild from 'esbuild';
import * as os from 'node:os';

import {
  FRONT_COMPONENT_ROUTER_PROVIDER_SPECIFIER,
  frontComponentRouterProviderPlugin,
} from '@/cli/utilities/build/common/front-component-build/front-component-router-provider-plugin';

// react-router-dom must NOT be marked external: the plugin probes its
// resolvability through build.resolve, and externals resolve trivially.
const buildProviderBundle = async (resolveDir: string): Promise<string> => {
  const result = await esbuild.build({
    stdin: {
      contents: `export { FrontComponentRouterProvider } from '${FRONT_COMPONENT_ROUTER_PROVIDER_SPECIFIER}';`,
      resolveDir,
      loader: 'js',
    },
    bundle: true,
    write: false,
    format: 'esm',
    external: ['react', 'twenty-sdk/front-component'],
    logLevel: 'silent',
    plugins: [frontComponentRouterProviderPlugin],
  });

  return result.outputFiles[0].text;
};

describe('frontComponentRouterProviderPlugin', () => {
  it('provides a host-navigator Router wrapper when react-router-dom is resolvable', async () => {
    const output = await buildProviderBundle(__dirname);

    expect(output).toContain('FrontComponentRouterProvider');
    // The host navigate bridge is only present in the router variant.
    expect(output).toContain('twenty-sdk/front-component');
  });

  it('falls back to a pass-through provider when react-router-dom is not resolvable', async () => {
    const output = await buildProviderBundle(os.tmpdir());

    expect(output).toContain('FrontComponentRouterProvider');
    expect(output).not.toContain('twenty-sdk/front-component');
  });
});
