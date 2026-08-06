import { ApiPath, AppPath } from 'twenty-shared/types';

import {
  API_PROXY_PATHS,
  buildApiProxyMatcher,
} from '~/config/apiProxyPrefixes';

const matchers = API_PROXY_PATHS.map(
  (apiPath) => new RegExp(buildApiProxyMatcher(apiPath)),
);

const isProxiedPath = (path: string) =>
  matchers.some((matcher) => matcher.test(path));

describe('apiProxyPrefixes', () => {
  it.each(Object.values(ApiPath))('should proxy the API path %s', (apiPath) => {
    expect(isProxiedPath(`/${apiPath}`)).toBe(true);
    expect(isProxiedPath(`/${apiPath}/nested-path`)).toBe(true);
    expect(isProxiedPath(`/${apiPath}?query=value`)).toBe(true);
  });

  it.each(Object.values(AppPath))(
    'should not proxy the SPA route %s',
    (appPath) => {
      expect(isProxiedPath(appPath)).toBe(false);
    },
  );

  const viteDevServerPaths = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/@vite/client',
    '/node_modules/.vite/deps/react.js',
  ];

  it.each(viteDevServerPaths)(
    'should not proxy the vite dev server path %s',
    (viteDevServerPath) => {
      expect(isProxiedPath(viteDevServerPath)).toBe(false);
    },
  );
});
