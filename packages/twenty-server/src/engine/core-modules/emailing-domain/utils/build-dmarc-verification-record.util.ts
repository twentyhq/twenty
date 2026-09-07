import { DMARC_MONITORING_POLICY } from 'src/engine/core-modules/emailing-domain/constants/dmarc-monitoring-policy.constant';
import { DMARC_RECORD_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/dmarc-record-prefix.constant';
import { DMARC_REPORT_MAILBOX } from 'src/engine/core-modules/emailing-domain/constants/dmarc-report-mailbox.constant';
import { DMARC_VERSION_TAG } from 'src/engine/core-modules/emailing-domain/constants/dmarc-version-tag.constant';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

export const buildDmarcVerificationRecord = (
  domain: string,
): VerificationRecord => ({
  type: 'TXT',
  key: `${DMARC_RECORD_PREFIX}.${domain}`,
  value: `${DMARC_VERSION_TAG}; ${DMARC_MONITORING_POLICY}; rua=mailto:${DMARC_REPORT_MAILBOX}@${domain}`,
});
