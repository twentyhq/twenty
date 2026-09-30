import { getRecordImportSessionCacheKey } from 'src/engine/core-modules/record-import/utils/get-record-import-session-cache-key.util';

export const getRecordImportEditsCacheKey = (session: {
  workspaceId: string;
  id: string;
}) => `${getRecordImportSessionCacheKey(session)}:edits`;
