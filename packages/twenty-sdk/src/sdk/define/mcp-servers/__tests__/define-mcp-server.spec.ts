import { describe, expect, it } from 'vitest';

import { defineMcpServer } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '0b6c4f7e-3d5a-4a8e-9a0d-6f1e2c3b4a01',
  name: 'github',
  label: 'GitHub',
  url: 'https://api.githubcopilot.com/mcp/',
  connectionProvider: {
    universalIdentifier: '0b6c4f7e-3d5a-4a8e-9a0d-6f1e2c3b4a02',
  },
};

describe('defineMcpServer', () => {
  it('returns success for a valid config', () => {
    const result = defineMcpServer(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts a public server without connection provider', () => {
    const { connectionProvider: _, ...publicServerConfig } = baseValidConfig;

    expect(defineMcpServer(publicServerConfig).success).toBe(true);
  });

  it.each(['GitHub', 'git-hub', '1github', 'a'.repeat(33)])(
    'rejects the name "%s"',
    (name) => {
      expect(defineMcpServer({ ...baseValidConfig, name }).success).toBe(false);
    },
  );

  it('rejects a url that is not http or https', () => {
    const result = defineMcpServer({
      ...baseValidConfig,
      url: 'ftp://example.com/mcp',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a connection provider reference that is not a UUID', () => {
    const result = defineMcpServer({
      ...baseValidConfig,
      connectionProvider: { universalIdentifier: 'github-oauth' },
    });

    expect(result.errors).toHaveLength(1);
  });
});
