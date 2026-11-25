import { probeProtectedResource } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/probe-protected-resource.util';

const RESOURCE_URL = 'https://mcp.example.com/mcp';

describe('probeProtectedResource', () => {
  it('reports the metadata and scope named by a 401', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(
      new Response(null, {
        status: 401,
        headers: {
          'WWW-Authenticate':
            'Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource", scope="read write"',
        },
      }),
    );

    const probe = await probeProtectedResource({
      resourceUrl: RESOURCE_URL,
      fetchFunction,
    });

    expect(probe.isSignInRequired).toBe(true);
    expect(probe.resourceMetadataUrl?.toString()).toBe(
      'https://mcp.example.com/.well-known/oauth-protected-resource',
    );
    expect(probe.scope).toBe('read write');
  });

  it('does not require a sign-in when the resource answers', async () => {
    const fetchFunction = jest
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }));

    await expect(
      probeProtectedResource({ resourceUrl: RESOURCE_URL, fetchFunction }),
    ).resolves.toEqual({ isSignInRequired: false });
  });
});
