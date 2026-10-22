import { describe, expect, it } from 'vitest';

import { defineMcpServer } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '7c1f0a6e-2d3b-4c5d-9e8f-0a1b2c3d4e5f',
  name: 'help_center',
  label: 'Help center',
  url: 'https://docs.twenty.com/mcp',
};

describe('defineMcpServer', () => {
  it('returns success for a valid config', () => {
    const result = defineMcpServer(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a non-UUID universalIdentifier', () => {
    const result = defineMcpServer({
      ...baseValidConfig,
      universalIdentifier: 'help-center',
    });

    expect(result.success).toBe(false);
    expect(
      result.errors.some((error) => error.includes('must be a UUID')),
    ).toBe(true);
  });

  it.each(['Help', 'help-center', '1help', 'a'.repeat(33)])(
    'rejects the name "%s"',
    (name) => {
      const result = defineMcpServer({ ...baseValidConfig, name });

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes('prefixes the tool names'),
        ),
      ).toBe(true);
    },
  );

  it('requires a label and an http(s) url', () => {
    const result = defineMcpServer({
      ...baseValidConfig,
      label: '',
      url: 'ftp://docs.twenty.com/mcp',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('MCP server must have a label');
    expect(
      result.errors.some((error) => error.includes('must be an http(s) URL')),
    ).toBe(true);
  });
});
