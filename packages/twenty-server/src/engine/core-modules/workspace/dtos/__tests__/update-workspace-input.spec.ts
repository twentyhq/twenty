import { validate } from 'class-validator';

import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

describe('workspace embedding origins validation', () => {
  it.each([
    undefined,
    [],
    ['https://portal.example.com'],
    ['https://portal.example.com:8443'],
  ])('accepts %j', async (allowedIframeOrigins) => {
    const input = Object.assign(new UpdateWorkspaceInput(), {
      allowedIframeOrigins,
    });

    expect(await validate(input)).toEqual([]);
  });

  it.each([
    null,
    'https://portal.example.com',
    [null],
    ['https://*.example.com'],
    ['https://example.com/path'],
    ['http://example.com'],
    ['https://example.com;'],
    Array.from(
      { length: 21 },
      (_, index) => `https://portal${index}.example.com`,
    ),
  ])('rejects %j', async (allowedIframeOrigins) => {
    const input = Object.assign(new UpdateWorkspaceInput(), {
      allowedIframeOrigins,
    });

    expect(await validate(input)).toEqual([
      expect.objectContaining({ property: 'allowedIframeOrigins' }),
    ]);
  });
});
