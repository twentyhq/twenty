import { DMARC_RECORD_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/dmarc-record-prefix.constant';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

const DMARC_MONITORING_ONLY_POLICY = 'p=none';
const SAME_DOMAIN_REPORT_MAILBOX = 'dmarc';

export const buildDmarcVerificationRecord = (
  domain: string,
): VerificationRecord => ({
  type: 'TXT',
  key: `${DMARC_RECORD_PREFIX}.${domain}`,
  value: `v=DMARC1; ${DMARC_MONITORING_ONLY_POLICY}; rua=mailto:${SAME_DOMAIN_REPORT_MAILBOX}@${domain}`,
});
