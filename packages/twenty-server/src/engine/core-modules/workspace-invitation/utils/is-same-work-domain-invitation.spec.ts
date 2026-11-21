import { isSameWorkDomainInvitation } from 'src/engine/core-modules/workspace-invitation/utils/is-same-work-domain-invitation.util';

describe('isSameWorkDomainInvitation', () => {
  it('returns true when a work email invites a colleague on the same domain', () => {
    expect(
      isSameWorkDomainInvitation({
        senderEmail: 'alice@xyz.com',
        inviteeEmail: 'bob@XYZ.com',
      }),
    ).toBe(true);
  });

  it('returns false when a work email invites someone on another domain', () => {
    expect(
      isSameWorkDomainInvitation({
        senderEmail: 'alice@xyz.com',
        inviteeEmail: 'victim@gmail.com',
      }),
    ).toBe(false);
  });

  it('returns false when a personal email invites someone on the same provider', () => {
    expect(
      isSameWorkDomainInvitation({
        senderEmail: 'Spammer@Gmail.com',
        inviteeEmail: 'victim@gmail.com',
      }),
    ).toBe(false);
  });
});
