import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ResendDomain } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-domain.type';
import { mapResendDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/map-resend-domain-status.util';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

const SENDING_RECORD_LABELS = ['SPF', 'DKIM'];

// A domain with receiving enabled reports partially_verified while its MX
// record is pending even though sending is fully set up, so outbound
// readiness is derived from the sending records rather than the aggregate
// domain status.
export const mapResendSendingStatus = (
  domain: ResendDomain,
): EmailingDomainStatus => {
  if (domain.status === 'verified') {
    return EmailingDomainStatus.VERIFIED;
  }

  const sendingRecords = (domain.records ?? []).filter((record) =>
    SENDING_RECORD_LABELS.includes(record.record.toUpperCase()),
  );

  if (!isNonEmptyArray(sendingRecords)) {
    return mapResendDomainStatus(domain.status);
  }

  if (sendingRecords.every((record) => record.status === 'verified')) {
    return EmailingDomainStatus.VERIFIED;
  }

  if (
    sendingRecords.some(
      (record) => record.status === 'failure' || record.status === 'failed',
    )
  ) {
    return EmailingDomainStatus.FAILED;
  }

  if (sendingRecords.some((record) => record.status === 'temporary_failure')) {
    return EmailingDomainStatus.TEMPORARY_FAILURE;
  }

  return EmailingDomainStatus.PENDING;
};
