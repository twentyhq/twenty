import { type GranolaPersonalCatchUpPayload } from 'src/logic-functions/types/granola-personal-catch-up-payload.type';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const buildGranolaPersonalCatchUpJob = (
  payload: GranolaPersonalCatchUpPayload,
) => ({
  payload,
  jobId: getGranolaJobId({
    prefix: payload.kind === 'note' ? 'granola-note' : 'granola-discovery',
    identity: payload,
  }),
});
