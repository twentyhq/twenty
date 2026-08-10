import { type CallHandler, type ExecutionContext } from '@nestjs/common';

import { type Request, type Response } from 'express';
import { of } from 'rxjs';

import { LegacyMetadataRouteDeprecationInterceptor } from 'src/engine/api/rest/metadata/interceptors/legacy-metadata-route-deprecation.interceptor';

const next = {
  handle: jest.fn(() => of(undefined)),
} as unknown as CallHandler;

const makeContext = ({
  originalUrl,
  setHeader,
}: {
  originalUrl: string;
  setHeader: jest.Mock;
}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl }) as Request,
      getResponse: () => ({ setHeader }) as unknown as Response,
    }),
  }) as unknown as ExecutionContext;

describe('LegacyMetadataRouteDeprecationInterceptor', () => {
  const interceptor = new LegacyMetadataRouteDeprecationInterceptor();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['/rest/apiKeys', '/rest/metadata/apiKeys'],
    ['/rest/webhooks/id-1?depth=1', '/rest/metadata/webhooks/id-1'],
  ])(
    'advertises the successor for legacy route %s',
    (originalUrl, successorPath) => {
      const setHeader = jest.fn();

      interceptor.intercept(makeContext({ originalUrl, setHeader }), next);

      expect(setHeader).toHaveBeenCalledWith('Deprecation', '@1786320000');
      expect(setHeader).toHaveBeenCalledWith(
        'Link',
        `<${successorPath}>; rel="successor-version"`,
      );
      expect(next.handle).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    '/rest/metadata/apiKeys',
    '/rest/metadata/webhooks/id-1',
    '/rest/apiKeysUnexpected',
  ])('does not mark canonical or lookalike route %s as deprecated', (url) => {
    const setHeader = jest.fn();

    interceptor.intercept(makeContext({ originalUrl: url, setHeader }), next);

    expect(setHeader).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledTimes(1);
  });
});
