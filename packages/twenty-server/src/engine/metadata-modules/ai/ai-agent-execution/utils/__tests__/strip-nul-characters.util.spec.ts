import { stripNulCharacters } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/strip-nul-characters.util';

describe('stripNulCharacters', () => {
  it('should remove NUL characters from a string', () => {
    expect(stripNulCharacters('Sheet\u00001\u0000')).toBe('Sheet1');
  });

  it('should remove NUL characters from strings nested in objects and arrays', () => {
    expect(
      stripNulCharacters({
        toolOutput: {
          rows: [['A\u0000', 'B'], ['C']],
          meta: { title: 'Report\u0000', count: 3, isEmpty: false },
        },
        providerMetadata: null,
      }),
    ).toEqual({
      toolOutput: {
        rows: [['A', 'B'], ['C']],
        meta: { title: 'Report', count: 3, isEmpty: false },
      },
      providerMetadata: null,
    });
  });

  it('should preserve a literal backslash followed by u0000', () => {
    expect(stripNulCharacters({ code: 'split("\\u0000")' })).toEqual({
      code: 'split("\\u0000")',
    });
  });
});
