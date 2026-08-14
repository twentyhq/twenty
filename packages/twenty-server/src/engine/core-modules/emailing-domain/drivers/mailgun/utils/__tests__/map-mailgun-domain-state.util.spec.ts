import { mapMailgunDomainState } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/utils/map-mailgun-domain-state.util';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

describe('mapMailgunDomainState', () => {
  it('should map provider states to emailing domain statuses', () => {
    expect(mapMailgunDomainState('active')).toBe(EmailingDomainStatus.VERIFIED);
    expect(mapMailgunDomainState('disabled')).toBe(EmailingDomainStatus.FAILED);
    expect(mapMailgunDomainState('unverified')).toBe(
      EmailingDomainStatus.PENDING,
    );
    expect(mapMailgunDomainState(undefined)).toBe(EmailingDomainStatus.PENDING);
  });
});
