import { describe, expect, it } from 'vitest';

import { getTeamsDirectoryUserEmail } from 'src/features/chat/logic-functions/utils/get-teams-directory-user-email';

describe('getTeamsDirectoryUserEmail', () => {
  it('prefers the mail attribute over the user principal name', () => {
    expect(
      getTeamsDirectoryUserEmail({
        id: 'aad-1',
        mail: 'ada@twenty.com',
        userPrincipalName: 'ada.lovelace@twenty.onmicrosoft.com',
      }),
    ).toBe('ada@twenty.com');
  });

  it('falls back to the user principal name when mail is empty', () => {
    expect(
      getTeamsDirectoryUserEmail({
        id: 'aad-1',
        mail: '',
        userPrincipalName: 'ada@twenty.com',
      }),
    ).toBe('ada@twenty.com');
  });

  it('skips guests invited from another tenant', () => {
    expect(
      getTeamsDirectoryUserEmail({
        id: 'aad-guest',
        mail: 'ada@twenty.com',
        userPrincipalName: 'ada_twenty.com#EXT#@partner.onmicrosoft.com',
      }),
    ).toBeUndefined();
  });
});
