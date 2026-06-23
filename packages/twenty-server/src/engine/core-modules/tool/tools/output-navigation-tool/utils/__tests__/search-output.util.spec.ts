import { SEARCH_OUTPUT_MAX_MATCH_LENGTH } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/search-output-max-match-length.constant';
import { searchOutput } from 'src/engine/core-modules/tool/tools/output-navigation-tool/utils/search-output.util';

const multiLineContent = [
  'line 0 ok',
  'line 1 error: boom',
  'line 2 ok',
  'line 3 error: kaboom',
  'line 4 ok',
  'line 5 error: splat',
].join('\n');

describe('searchOutput', () => {
  it('returns each occurrence with a character window and offset', () => {
    const result = searchOutput({
      content: multiLineContent,
      pattern: 'error',
      maxMatches: 10,
      offset: 0,
      contextChars: 5,
    });

    expect(result.totalMatches).toBe(3);
    expect(result.hasMore).toBe(false);
    expect(result.matches).toHaveLength(3);
    expect(result.matches[0].match).toBe('error');
    expect(result.matches[0].charOffset).toBe(
      multiLineContent.indexOf('error'),
    );
    expect(result.matches[0].context).toContain('error');
    expect(result.matches[0].context.endsWith('…')).toBe(true);
  });

  it('finds every occurrence on a single newline-free line', () => {
    const compact = '{"a":"error","b":"error","c":"error"}';

    const result = searchOutput({
      content: compact,
      pattern: 'error',
      maxMatches: 10,
      offset: 0,
      contextChars: 0,
    });

    expect(result.totalMatches).toBe(3);
    expect(result.matches).toHaveLength(3);
    expect(result.matches.map((match) => match.charOffset)).toEqual([
      compact.indexOf('error'),
      compact.indexOf('error', compact.indexOf('error') + 1),
      compact.lastIndexOf('error'),
    ]);
  });

  it('caps results at maxMatches and reports hasMore', () => {
    const result = searchOutput({
      content: multiLineContent,
      pattern: 'error',
      maxMatches: 2,
      offset: 0,
      contextChars: 0,
    });

    expect(result.totalMatches).toBe(3);
    expect(result.matches).toHaveLength(2);
    expect(result.hasMore).toBe(true);
  });

  it('paginates with offset', () => {
    const result = searchOutput({
      content: multiLineContent,
      pattern: 'error',
      maxMatches: 2,
      offset: 2,
      contextChars: 0,
    });

    expect(result.totalMatches).toBe(3);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].charOffset).toBe(
      multiLineContent.lastIndexOf('error'),
    );
    expect(result.hasMore).toBe(false);
  });

  it('returns an empty result for zero matches', () => {
    const result = searchOutput({
      content: multiLineContent,
      pattern: 'nonexistent',
      maxMatches: 10,
      offset: 0,
      contextChars: 2,
    });

    expect(result).toEqual({ matches: [], totalMatches: 0, hasMore: false });
  });

  it('supports regex patterns', () => {
    const result = searchOutput({
      content: multiLineContent,
      pattern: 'splat|boom',
      maxMatches: 10,
      offset: 0,
      contextChars: 0,
    });

    expect(result.totalMatches).toBe(3);
  });

  it('terminates on a zero-width pattern instead of looping forever', () => {
    const result = searchOutput({
      content: 'abc',
      pattern: 'x*',
      maxMatches: 10,
      offset: 0,
      contextChars: 0,
    });

    expect(result.totalMatches).toBeGreaterThan(0);
    expect(result.matches.every((match) => match.match === '')).toBe(true);
  });

  it('stays responsive on a catastrophic-backtracking pattern (RE2)', () => {
    const adversarial = `${'a'.repeat(5000)}!`;

    const start = Date.now();
    const result = searchOutput({
      content: adversarial,
      pattern: '(a+)+$',
      maxMatches: 10,
      offset: 0,
      contextChars: 0,
    });

    expect(Date.now() - start).toBeLessThan(1000);
    expect(result.totalMatches).toBe(0);
  });

  it('falls back to literal matching for unsupported regex features (lookahead)', () => {
    const result = searchOutput({
      content: 'contains (?=foo) literally',
      pattern: '(?=foo)',
      maxMatches: 10,
      offset: 0,
      contextChars: 0,
    });

    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toBe('(?=foo)');
  });

  it('falls back to literal matching for invalid regex', () => {
    const result = searchOutput({
      content: 'a (b c d e f',
      pattern: '(b',
      maxMatches: 10,
      offset: 0,
      contextChars: 0,
    });

    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toBe('(b');
  });

  it('truncates an overly long single match with a centered ellipsis', () => {
    const longMatch = 'z'.repeat(SEARCH_OUTPUT_MAX_MATCH_LENGTH + 200);

    const result = searchOutput({
      content: longMatch,
      pattern: 'z+',
      maxMatches: 10,
      offset: 0,
      contextChars: 0,
    });

    expect(result.totalMatches).toBe(1);
    expect(result.matches[0].match).toContain('…');
    expect(result.matches[0].match.length).toBeLessThanOrEqual(
      SEARCH_OUTPUT_MAX_MATCH_LENGTH,
    );
  });

  it('throws for an empty pattern instead of matching everything', () => {
    expect(() =>
      searchOutput({
        content: multiLineContent,
        pattern: '',
        maxMatches: 10,
        offset: 0,
        contextChars: 0,
      }),
    ).toThrow('Search pattern must be a non-empty string.');
  });
});
