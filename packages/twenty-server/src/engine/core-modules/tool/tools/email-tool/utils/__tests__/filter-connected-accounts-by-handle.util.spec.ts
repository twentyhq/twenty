import { filterConnectedAccountsByHandle } from 'src/engine/core-modules/tool/tools/email-tool/utils/filter-connected-accounts-by-handle.util';

const ownAccount = {
  id: 'own-account-id',
  handle: 'Me@Example.com',
  handleAliases: ['me.alias@example.com'],
};

const sharedAccount = {
  id: 'shared-account-id',
  handle: 'team@example.com',
  handleAliases: null,
};

const connectedAccounts = [ownAccount, sharedAccount];

describe('filterConnectedAccountsByHandle', () => {
  it('matches the primary handle regardless of case and surrounding spaces', () => {
    expect(
      filterConnectedAccountsByHandle({
        connectedAccounts,
        handle: '  ME@EXAMPLE.COM ',
      }),
    ).toEqual([ownAccount]);
  });

  it('matches a verified alias', () => {
    expect(
      filterConnectedAccountsByHandle({
        connectedAccounts,
        handle: 'ME.ALIAS@example.com',
      }),
    ).toEqual([ownAccount]);
  });

  it('matches an account without aliases', () => {
    expect(
      filterConnectedAccountsByHandle({
        connectedAccounts,
        handle: 'team@example.com',
      }),
    ).toEqual([sharedAccount]);
  });

  it('returns no account when the handle only partially matches', () => {
    expect(
      filterConnectedAccountsByHandle({
        connectedAccounts,
        handle: 'me@example',
      }),
    ).toEqual([]);
  });

  it('returns no account when nothing matches', () => {
    expect(
      filterConnectedAccountsByHandle({
        connectedAccounts,
        handle: 'stranger@example.com',
      }),
    ).toEqual([]);
  });
});
