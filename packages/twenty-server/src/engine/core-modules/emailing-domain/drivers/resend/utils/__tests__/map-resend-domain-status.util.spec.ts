import { mapResendDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/map-resend-domain-status.util';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

describe('mapResendDomainStatus', () => {
  it('should map provider statuses to emailing domain statuses', () => {
    expect(mapResendDomainStatus('verified')).toBe(
      EmailingDomainStatus.VERIFIED,
    );
    expect(mapResendDomainStatus('failure')).toBe(EmailingDomainStatus.FAILED);
    expect(mapResendDomainStatus('failed')).toBe(EmailingDomainStatus.FAILED);
    expect(mapResendDomainStatus('temporary_failure')).toBe(
      EmailingDomainStatus.TEMPORARY_FAILURE,
    );
    expect(mapResendDomainStatus('not_started')).toBe(
      EmailingDomainStatus.PENDING,
    );
    expect(mapResendDomainStatus('pending')).toBe(EmailingDomainStatus.PENDING);
    expect(mapResendDomainStatus(undefined)).toBe(EmailingDomainStatus.PENDING);
  });
});
