import { validate } from 'class-validator';
import { UpdateWorkspaceAllowedEmbeddingOriginsInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-allowed-embedding-origins.input';

describe('workspace embedding origin edits', () => {
  it.each([
    'https://portal.example.com',
    'http://portal.corp.lan',
    'https://PORTAL.example.com:443/',
  ])('accepts an explicit origin: %s', async (origin) => {
    const input = Object.assign(
      new UpdateWorkspaceAllowedEmbeddingOriginsInput(),
      { operation: 'add', origin },
    );
    expect(await validate(input)).toEqual([]);
  });
  it.each([
    '*',
    'https://*.example.com',
    'https://example.com/path',
    'https://user:password@example.com',
    'javascript:alert(1)',
    null,
    undefined,
  ])('rejects an invalid origin: %s', async (origin) => {
    const input = Object.assign(
      new UpdateWorkspaceAllowedEmbeddingOriginsInput(),
      { operation: 'add', origin },
    );
    expect(await validate(input)).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'origin' })]),
    );
  });
  it('rejects replacing the whole list', async () => {
    const input = Object.assign(
      new UpdateWorkspaceAllowedEmbeddingOriginsInput(),
      { operation: 'replace', origin: 'https://portal.example.com' },
    );
    expect(await validate(input)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'operation' }),
      ]),
    );
  });
});
