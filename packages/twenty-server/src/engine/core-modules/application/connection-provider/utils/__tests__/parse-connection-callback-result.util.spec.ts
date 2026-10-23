import { parseConnectionCallbackResult } from 'src/engine/core-modules/application/connection-provider/utils/parse-connection-callback-result.util';
import { EXTERNAL_ACCOUNT_ID_MAX_LENGTH } from 'src/engine/metadata-modules/connected-account/constants/external-account-id-max-length.constant';

describe('parseConnectionCallbackResult', () => {
  it('returns the trimmed id and handle with the access token', () => {
    expect(
      parseConnectionCallbackResult({
        externalAccountId: ' account-a ',
        handle: ' Jane Doe ',
        accessToken: 'token-a',
      }),
    ).toEqual({
      isValid: true,
      connectedAccount: {
        externalAccountId: 'account-a',
        handle: 'Jane Doe',
        accessToken: 'token-a',
      },
    });
  });

  it('leaves out the handle and access token when they are absent or null', () => {
    expect(
      parseConnectionCallbackResult({
        externalAccountId: 'account-a',
        handle: null,
      }),
    ).toEqual({
      isValid: true,
      connectedAccount: { externalAccountId: 'account-a' },
    });
  });

  it.each([null, undefined])(
    'treats %s as a request without an account to save',
    (data) => {
      expect(parseConnectionCallbackResult(data)).toEqual({
        isValid: true,
        connectedAccount: null,
      });
    },
  );

  it.each([
    ['a missing id', { handle: 'Jane Doe' }],
    ['a null id', { externalAccountId: null }],
    ['a blank id', { externalAccountId: '   ' }],
    [
      'an id over the maximum length',
      { externalAccountId: 'a'.repeat(EXTERNAL_ACCOUNT_ID_MAX_LENGTH + 1) },
    ],
    ['an empty access token', { externalAccountId: 'a', accessToken: '' }],
  ])('rejects %s', (_label, data) => {
    expect(parseConnectionCallbackResult(data)).toEqual({
      isValid: false,
      reason: expect.any(String),
    });
  });
});
