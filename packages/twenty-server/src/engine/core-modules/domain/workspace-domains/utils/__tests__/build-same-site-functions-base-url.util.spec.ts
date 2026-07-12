import { buildSameSiteFunctionsBaseUrl } from 'src/engine/core-modules/domain/workspace-domains/utils/build-same-site-functions-base-url.util';

describe('buildSameSiteFunctionsBaseUrl', () => {
  it('should append the functions route in single-workspace mode', () => {
    expect(
      buildSameSiteFunctionsBaseUrl({
        serverUrl: 'https://api.example.com',
        isMultiWorkspaceEnabled: false,
        workspaceSubdomain: 'acme',
      }),
    ).toBe('https://api.example.com/s');
  });

  it('should preserve the server path and prefix the host in multi-workspace mode', () => {
    expect(
      buildSameSiteFunctionsBaseUrl({
        serverUrl: 'http://localhost:3000/base/',
        isMultiWorkspaceEnabled: true,
        workspaceSubdomain: 'acme',
      }),
    ).toBe('http://acme.localhost:3000/base/s');
  });

  it('should keep the server host when the workspace subdomain is empty', () => {
    expect(
      buildSameSiteFunctionsBaseUrl({
        serverUrl: 'https://api.example.com',
        isMultiWorkspaceEnabled: true,
        workspaceSubdomain: '',
      }),
    ).toBe('https://api.example.com/s');
  });

  it('should drop the server URL query and fragment', () => {
    expect(
      buildSameSiteFunctionsBaseUrl({
        serverUrl: 'https://api.example.com/base?utm=1#fragment',
        isMultiWorkspaceEnabled: false,
        workspaceSubdomain: 'acme',
      }),
    ).toBe('https://api.example.com/base/s');
  });
});
