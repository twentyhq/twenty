import { buildRegistryRequestHeaders } from 'src/engine/core-modules/application/application-package/utils/build-registry-request-headers.util';

describe('buildRegistryRequestHeaders', () => {
  const registryUrl = 'https://registry.example.com/';

  it('sends the token to the registry host', () => {
    expect(
      buildRegistryRequestHeaders({
        url: 'https://registry.example.com/@scope/app/-/app-1.0.0.tgz',
        registryUrl,
        authToken: 'secret',
      }),
    ).toEqual({ Authorization: 'Bearer secret' });
  });

  it('keeps the token away from other hosts', () => {
    expect(
      buildRegistryRequestHeaders({
        url: 'https://cdn.example.com/@scope/app/-/app-1.0.0.tgz',
        registryUrl,
        authToken: 'secret',
      }),
    ).toEqual({});
  });

  it('sends nothing without a token', () => {
    expect(
      buildRegistryRequestHeaders({
        url: 'https://registry.example.com/@scope/app/-/app-1.0.0.tgz',
        registryUrl,
        authToken: undefined,
      }),
    ).toEqual({});
    expect(
      buildRegistryRequestHeaders({
        url: 'https://registry.example.com/@scope/app/-/app-1.0.0.tgz',
        registryUrl,
        authToken: '',
      }),
    ).toEqual({});
  });
});
