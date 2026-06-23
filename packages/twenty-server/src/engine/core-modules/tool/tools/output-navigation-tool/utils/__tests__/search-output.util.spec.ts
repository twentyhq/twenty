import { searchOutput } from 'src/engine/core-modules/tool/tools/output-navigation-tool/utils/search-output.util';

const content = [
  'line 0 ok',
  'line 1 error: boom',
  'line 2 ok',
  'line 3 error: kaboom',
  'line 4 ok',
  'line 5 error: splat',
].join('\n');

describe('searchOutput', () => {
  it('returns matches with context and line numbers', () => {
    const result = searchOutput({
      content,
      pattern: 'error',
      maxMatches: 10,
      offset: 0,
      contextLines: 1,
    });

    expect(result.totalMatches).toBe(3);
    expect(result.hasMore).toBe(false);
    expect(result.matches[0]).toEqual({
      lineNumber: 2,
      match: 'line 1 error: boom',
      context: '1: line 0 ok\n2: line 1 error: boom\n3: line 2 ok',
    });
  });

  it('caps results at maxMatches and reports hasMore', () => {
    const result = searchOutput({
      content,
      pattern: 'error',
      maxMatches: 2,
      offset: 0,
      contextLines: 0,
    });

    expect(result.totalMatches).toBe(3);
    expect(result.matches).toHaveLength(2);
    expect(result.hasMore).toBe(true);
  });

  it('paginates with offset', () => {
    const result = searchOutput({
      content,
      pattern: 'error',
      maxMatches: 2,
      offset: 2,
      contextLines: 0,
    });

    expect(result.totalMatches).toBe(3);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].lineNumber).toBe(6);
    expect(result.hasMore).toBe(false);
  });

  it('returns an empty result for zero matches', () => {
    const result = searchOutput({
      content,
      pattern: 'nonexistent',
      maxMatches: 10,
      offset: 0,
      contextLines: 2,
    });

    expect(result).toEqual({ matches: [], totalMatches: 0, hasMore: false });
  });

  it('supports regex patterns', () => {
    const result = searchOutput({
      content,
      pattern: 'splat|boom',
      maxMatches: 10,
      offset: 0,
      contextLines: 0,
    });

    expect(result.totalMatches).toBe(3);
  });

  it('keeps the matched text visible when it sits past the truncation cutoff', () => {
    const longLine = `${'a'.repeat(800)}NEEDLE${'b'.repeat(800)}`;

    const result = searchOutput({
      content: longLine,
      pattern: 'NEEDLE',
      maxMatches: 10,
      offset: 0,
      contextLines: 0,
    });

    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toContain('NEEDLE');
    expect(result.matches[0].match.startsWith('…')).toBe(true);
    expect(result.matches[0].match.endsWith('…')).toBe(true);
  });

  it('throws for an empty pattern instead of matching everything', () => {
    expect(() =>
      searchOutput({
        content,
        pattern: '',
        maxMatches: 10,
        offset: 0,
        contextLines: 0,
      }),
    ).toThrow('Search pattern must be a non-empty string.');
  });

  it('falls back to literal matching for invalid regex', () => {
    const result = searchOutput({
      content: 'a (b c\nd e f',
      pattern: '(b',
      maxMatches: 10,
      offset: 0,
      contextLines: 0,
    });

    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toBe('a (b c');
  });
});
