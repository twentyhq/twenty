import { getProgressToken } from 'src/engine/api/mcp/utils/get-progress-token.util';

describe('getProgressToken', () => {
  it.each([['abc123'], [4], [0], [-7]])(
    'should return the token %p supplied by the client',
    (progressToken) => {
      expect(getProgressToken({ _meta: { progressToken } })).toBe(
        progressToken,
      );
    },
  );

  it('should return undefined when params carry no _meta', () => {
    expect(getProgressToken({ name: 'learn_tools' })).toBeUndefined();
  });

  it('should return undefined when _meta carries no progressToken', () => {
    expect(getProgressToken({ _meta: { other: 'value' } })).toBeUndefined();
  });

  it.each([[null], ['abc123']])(
    'should return undefined when _meta is %p',
    (meta) => {
      expect(getProgressToken({ _meta: meta })).toBeUndefined();
    },
  );

  it.each([
    [true],
    [{}],
    [[]],
    [null],
    [1.5],
    [-0.25],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
  ])(
    'should return undefined for the non conformant token %p',
    (progressToken) => {
      expect(getProgressToken({ _meta: { progressToken } })).toBeUndefined();
    },
  );
});
