import { CALL_RECORDING_ARTIFACT_IMPORT_CLAIM_TTL_MS } from 'src/logic-functions/constants/call-recording-artifact-import-claim-ttl-ms';
import { CALL_RECORDING_ARTIFACT_IMPORT_REQUEUE_DELAY_MS } from 'src/logic-functions/constants/call-recording-artifact-import-requeue-delay-ms';

// A job bounced off a held lease must keep retrying past that lease, otherwise a
// webhook whose only signal is the bounced delivery is lost until the sweep runs.
export const CALL_RECORDING_ARTIFACT_IMPORT_MAX_ATTEMPTS =
  Math.ceil(
    CALL_RECORDING_ARTIFACT_IMPORT_CLAIM_TTL_MS /
      CALL_RECORDING_ARTIFACT_IMPORT_REQUEUE_DELAY_MS,
  ) + 1;
