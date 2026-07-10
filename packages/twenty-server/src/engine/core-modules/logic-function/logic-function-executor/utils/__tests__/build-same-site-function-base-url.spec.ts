import { buildSameSiteFunctionBaseUrl } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-same-site-function-base-url';

describe('buildSameSiteFunctionBaseUrl', () => {
  it('prepends the workspace subdomain and the /s route in multi-workspace mode', () => {
    expect(
      buildSameSiteFunctionBaseUrl({
        serverUrl: 'http://localhost:3000',
        subdomain: 'acme',
        isMultiWorkspaceEnabled: true,
      }),
    ).toBe('http://acme.localhost:3000/s');
  });

  it('does not prepend a subdomain in single-workspace mode', () => {
    expect(
      buildSameSiteFunctionBaseUrl({
        serverUrl: 'http://localhost:3000',
        subdomain: 'acme',
        isMultiWorkspaceEnabled: false,
      }),
    ).toBe('http://localhost:3000/s');
  });

  it('does not prepend when the subdomain is empty', () => {
    expect(
      buildSameSiteFunctionBaseUrl({
        serverUrl: 'http://localhost:3000',
        subdomain: '',
        isMultiWorkspaceEnabled: true,
      }),
    ).toBe('http://localhost:3000/s');
  });

  it('preserves scheme and host and drops a trailing slash', () => {
    expect(
      buildSameSiteFunctionBaseUrl({
        serverUrl: 'https://api.example.com/',
        subdomain: 'acme',
        isMultiWorkspaceEnabled: true,
      }),
    ).toBe('https://acme.api.example.com/s');
  });
});
