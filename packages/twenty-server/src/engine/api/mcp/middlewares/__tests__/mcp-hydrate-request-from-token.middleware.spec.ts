import { McpHydrateRequestFromTokenMiddleware } from 'src/engine/api/mcp/middlewares/mcp-hydrate-request-from-token.middleware';

describe('McpHydrateRequestFromTokenMiddleware', () => {
  const hydrateGraphqlRequest = jest.fn();
  const middleware = new McpHydrateRequestFromTokenMiddleware({
    hydrateGraphqlRequest,
  } as never);

  const next = jest.fn();

  beforeEach(() => {
    hydrateGraphqlRequest.mockReset();
    next.mockReset();
  });

  it('hydrates then calls next when token bind succeeds', async () => {
    hydrateGraphqlRequest.mockResolvedValue(undefined);

    await middleware.use({} as never, {} as never, next);

    expect(hydrateGraphqlRequest).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('still calls next when hydrate throws (McpAuthGuard owns 401)', async () => {
    hydrateGraphqlRequest.mockRejectedValue(new Error('invalid token'));

    await middleware.use({} as never, {} as never, next);

    expect(next).toHaveBeenCalled();
  });
});
