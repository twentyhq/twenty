import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { parseOAuthState } from 'src/engine/core-modules/auth/utils/parse-oauth-state.util';

type TestState = {
  transientToken?: string;
  redirectLocation?: string;
};

describe('parseOAuthState', () => {
  it('should return undefined when state is not a string', () => {
    expect(parseOAuthState<TestState>(undefined)).toBeUndefined();
  });

  it('should parse valid JSON state string', () => {
    const state = { transientToken: 'abc', redirectLocation: '/test' };

    expect(parseOAuthState<TestState>(JSON.stringify(state))).toEqual(state);
  });

  it('should throw AuthException for malformed JSON string', () => {
    expect(() => parseOAuthState<TestState>('{invalid')).toThrow(AuthException);
  });
});
