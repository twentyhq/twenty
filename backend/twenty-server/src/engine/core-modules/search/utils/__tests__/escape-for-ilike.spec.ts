import { escapeForIlike } from 'src/engine/core-modules/search/utils/escape-for-ilike';

describe('escapeForIlike', () => {
  it('should escape percent signs', () => {
    expect(escapeForIlike('100%')).toBe('100\\%');
  });

  it('should escape underscores', () => {
    expect(escapeForIlike('my_company')).toBe('my\\_company');
  });

  it('should escape backslashes', () => {
    expect(escapeForIlike('path\\to')).toBe('path\\\\to');
  });

  it('should leave normal text unchanged', () => {
    expect(escapeForIlike('hello world')).toBe('hello world');
  });

  it('should handle CJK text unchanged', () => {
    expect(escapeForIlike('商业线索')).toBe('商业线索');
  });

  it('should handle multiple special characters', () => {
    expect(escapeForIlike('50%_off\\deal')).toBe('50\\%\\_off\\\\deal');
  });
});
