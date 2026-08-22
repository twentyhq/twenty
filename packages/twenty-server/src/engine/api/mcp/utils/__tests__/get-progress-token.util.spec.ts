import { getProgressToken } from 'src/engine/api/mcp/utils/get-progress-token.util';

describe('getProgressToken', () => {
  it('should return the string token supplied by the client', () => {
    expect(getProgressToken({ _meta: { progressToken: 'abc123' } })).toBe(
      'abc123',
    );
  });

  it('should return the numeric token supplied by the client', () => {
    expect(getProgressToken({ _meta: { progressToken: 4 } })).toBe(4);
  });

  it('should return a zero token rather than treating it as absent', () => {
    expect(getProgressToken({ _meta: { progressToken: 0 } })).toBe(0);
  });

  it('should return a negative integer token', () => {
    expect(getProgressToken({ _meta: { progressToken: -7 } })).toBe(-7);
  });

  it('should return undefined when params carry no _meta', () => {
    expect(getProgressToken({ name: 'learn_tools' })).toBeUndefined();
  });

  it('should return undefined when _meta carries no progressToken', () => {
    expect(getProgressToken({ _meta: { other: 'value' } })).toBeUndefined();
  });

  it('should return undefined when _meta is null', () => {
    expect(getProgressToken({ _meta: null })).toBeUndefined();
  });

  it('should return undefined when _meta is not an object', () => {
    expect(getProgressToken({ _meta: 'abc123' })).toBeUndefined();
  });

  it.each([[true], [{}], [[]], [null]])(
    'should return undefined for the non string or number token %p',
    (progressToken) => {
      expect(getProgressToken({ _meta: { progressToken } })).toBeUndefined();
    },
  );

  // ProgressToken is typed ["string", "integer"], so a fractional number is not
  // a token we may echo
  it.each([[1.5], [-0.25], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'should return undefined for the non integer numeric token %p',
    (progressToken) => {
      expect(getProgressToken({ _meta: { progressToken } })).toBeUndefined();
    },
  );
});
