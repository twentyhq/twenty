import { parseIdentifyAccountResult } from 'src/engine/core-modules/application/connection-provider/utils/parse-identify-account-result.util';
import { EXTERNAL_ACCOUNT_ID_MAX_LENGTH } from 'src/engine/metadata-modules/connected-account/constants/external-account-id-max-length.constant';

describe('parseIdentifyAccountResult', () => {
  it('returns the trimmed id and handle', () => {
    expect(
      parseIdentifyAccountResult({
        externalAccountId: ' team-a ',
        handle: ' Team A ',
      }),
    ).toEqual({
      isValid: true,
      identifiedAccount: { externalAccountId: 'team-a', handle: 'Team A' },
    });
  });

  it('leaves the handle out when it is absent or null', () => {
    expect(
      parseIdentifyAccountResult({ externalAccountId: 'team-a', handle: null }),
    ).toEqual({
      isValid: true,
      identifiedAccount: { externalAccountId: 'team-a' },
    });
  });

  it('treats a null id as the explicit opt-out', () => {
    expect(parseIdentifyAccountResult({ externalAccountId: null })).toEqual({
      isValid: true,
      identifiedAccount: null,
    });
  });

  it('accepts an id of exactly the maximum length', () => {
    const externalAccountId = 'a'.repeat(EXTERNAL_ACCOUNT_ID_MAX_LENGTH);

    expect(parseIdentifyAccountResult({ externalAccountId })).toEqual({
      isValid: true,
      identifiedAccount: { externalAccountId },
    });
  });

  it.each([
    ['a missing return', undefined],
    ['a bare null', null],
    ['a non-object', 'team-a'],
    ['a missing id', {}],
    ['an empty id', { externalAccountId: '   ' }],
    ['a numeric id', { externalAccountId: 42 }],
    [
      'an id over the maximum length',
      { externalAccountId: 'a'.repeat(EXTERNAL_ACCOUNT_ID_MAX_LENGTH + 1) },
    ],
    ['an empty handle', { externalAccountId: 'team-a', handle: '' }],
    ['a non-string handle', { externalAccountId: 'team-a', handle: 7 }],
  ])('rejects %s', (_label, data) => {
    const outcome = parseIdentifyAccountResult(data);

    expect(outcome.isValid).toBe(false);
    expect(outcome).toHaveProperty('reason', expect.any(String));
  });
});
