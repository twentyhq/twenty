import { buildMcpServerCard } from 'src/engine/core-modules/well-known/utils/build-mcp-server-card.util';

describe('buildMcpServerCard', () => {
  it('advertises the streamable-http endpoint on the given host', () => {
    const card = buildMcpServerCard({
      baseUrl: 'https://mycompany.twenty.com',
      version: '1.2.3',
    });

    expect(card.remotes).toHaveLength(1);
    expect(card.remotes[0]).toMatchObject({
      type: 'streamable-http',
      url: 'https://mycompany.twenty.com/mcp',
      supportedProtocolVersions: expect.arrayContaining([
        '2026-07-28',
        '2025-11-25',
        '2025-06-18',
      ]),
    });
  });

  it('carries the registry schema, stable identity and passed version', () => {
    const card = buildMcpServerCard({
      baseUrl: 'https://api.twenty.com',
      version: '0.42.0',
    });

    expect(card.$schema).toBe(
      'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    );
    expect(card.name).toBe('com.twenty/twenty');
    expect(card.version).toBe('0.42.0');
    expect(card.repository.source).toBe('github');
  });

  it('marks the Authorization header optional and secret (OAuth or API key)', () => {
    const card = buildMcpServerCard({
      baseUrl: 'https://mycompany.twenty.com',
      version: '1.0.0',
    });

    expect(card.remotes[0].headers).toEqual([
      expect.objectContaining({
        name: 'Authorization',
        isRequired: false,
        isSecret: true,
      }),
    ]);
  });
});
