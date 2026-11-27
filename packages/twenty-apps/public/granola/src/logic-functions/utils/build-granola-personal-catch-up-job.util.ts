import { type GranolaPersonalCatchUpPayload } from 'src/logic-functions/types/granola-personal-catch-up-payload.type';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const buildGranolaPersonalCatchUpJob = (
  payload: GranolaPersonalCatchUpPayload,
) => {
  const { connectionId, userWorkspaceId } = payload.scope;
  const identity = {
    connectionId,
    userWorkspaceId,
    updatedAfter: payload.updatedAfter,
  };

  if (payload.kind === 'note') {
    return {
      payload,
      jobId: getGranolaJobId({
        prefix: 'granola-note',
        identity: { ...identity, noteId: payload.noteId },
      }),
    };
  }

  return {
    payload,
    jobId: getGranolaJobId({
      prefix: 'granola-discovery',
      identity: {
        ...identity,
        folderId: payload.folderId,
        cursor: payload.cursor,
        pageIndex: payload.pageIndex,
      },
    }),
  };
};
