import { AppPath } from 'twenty-shared/types';

import {
  API_PROXY_PREFIXES,
  buildApiProxyMatcher,
} from '~/config/apiProxyPrefixes';

const matchers = API_PROXY_PREFIXES.map(
  (prefix) => new RegExp(buildApiProxyMatcher(prefix)),
);

const isProxiedPath = (path: string) =>
  matchers.some((matcher) => matcher.test(path));

describe('apiProxyPrefixes', () => {
  const backendPaths = [
    '/graphql',
    '/graphql?op=query',
    '/metadata',
    '/metadata?query=%7B__typename%7D',
    '/admin-panel',
    '/auth/google/redirect',
    '/auth/verify',
    '/oauth/token',
    '/client-config',
    '/file/profile-picture/some-id/image.png',
    '/files/application-registrations/some-id/logo.png',
    '/rest/companies',
    '/rest/metadata/objects',
    '/s/short-id',
    '/mcp',
    '/healthz',
    '/webhooks/server',
    '/apps/connections',
    '/app/billing',
    '/emailing/unsubscribe/some-token',
    '/application-registration-claim',
    '/.well-known/oauth-authorization-server',
  ];

  it.each(backendPaths)('should proxy the backend path %s', (backendPath) => {
    expect(isProxiedPath(backendPath)).toBe(true);
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
