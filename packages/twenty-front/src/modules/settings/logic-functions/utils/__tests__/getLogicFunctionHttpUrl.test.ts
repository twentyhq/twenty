import {
  getFunctionsBaseUrl,
  getLogicFunctionHttpUrl,
} from '@/settings/logic-functions/utils/getLogicFunctionHttpUrl';

describe('getFunctionsBaseUrl', () => {
  it('builds the isolated base from subdomain + public domain', () => {
    expect(
      getFunctionsBaseUrl({
        serverBaseUrl: 'https://api.twenty.com',
        publicFunctionDomain: 'withtwenty.com',
        workspaceSubdomain: 'acme',
      }),
    ).toBe('https://acme.withtwenty.com');
  });

  it('falls back to the /s server route when the public domain is missing', () => {
    expect(
      getFunctionsBaseUrl({
        serverBaseUrl: 'https://api.twenty.com',
        publicFunctionDomain: null,
        workspaceSubdomain: 'acme',
      }),
    ).toBe('https://api.twenty.com/s');
  });

  it('falls back to the /s server route when the subdomain is missing', () => {
    expect(
      getFunctionsBaseUrl({
        serverBaseUrl: 'https://api.twenty.com',
        publicFunctionDomain: 'withtwenty.com',
        workspaceSubdomain: undefined,
      }),
    ).toBe('https://api.twenty.com/s');
  });

  it('should preserve the server path and prepend the workspace subdomain in multi-workspace mode', () => {
    expect(
      getFunctionsBaseUrl({
        serverBaseUrl: 'http://localhost:3000/base/',
        publicFunctionDomain: null,
        workspaceSubdomain: 'acme',
        isMultiWorkspaceEnabled: true,
      }),
    ).toBe('http://acme.localhost:3000/base/s');
  });

  it('should not prepend a subdomain in single-workspace mode', () => {
    expect(
      getFunctionsBaseUrl({
        serverBaseUrl: 'http://localhost:3000',
        publicFunctionDomain: null,
        workspaceSubdomain: 'acme',
        isMultiWorkspaceEnabled: false,
      }),
    ).toBe('http://localhost:3000/s');
  });
});

describe('getLogicFunctionHttpUrl', () => {
  it('builds the isolated public-domain URL when configured', () => {
    expect(
      getLogicFunctionHttpUrl({
        path: '/webhook/stripe',
        serverBaseUrl: 'https://api.twenty.com',
        publicFunctionDomain: 'withtwenty.com',
        workspaceSubdomain: 'acme',
      }),
    ).toBe('https://acme.withtwenty.com/webhook/stripe');
  });

  it('normalizes a path that does not start with a slash', () => {
    expect(
      getLogicFunctionHttpUrl({
        path: 'webhook',
        serverBaseUrl: 'https://api.twenty.com',
        publicFunctionDomain: 'withtwenty.com',
        workspaceSubdomain: 'acme',
      }),
    ).toBe('https://acme.withtwenty.com/webhook');
  });

  it('falls back to the legacy /s/ route when no public domain is configured', () => {
    expect(
      getLogicFunctionHttpUrl({
        path: '/webhook/stripe',
        serverBaseUrl: 'https://api.twenty.com',
        publicFunctionDomain: null,
        workspaceSubdomain: 'acme',
      }),
    ).toBe('https://api.twenty.com/s/webhook/stripe');
  });

  it('falls back to the legacy /s/ route when the workspace has no subdomain', () => {
    expect(
      getLogicFunctionHttpUrl({
        path: '/webhook',
        serverBaseUrl: 'https://api.twenty.com',
        publicFunctionDomain: 'withtwenty.com',
        workspaceSubdomain: undefined,
      }),
    ).toBe('https://api.twenty.com/s/webhook');
  });
});
