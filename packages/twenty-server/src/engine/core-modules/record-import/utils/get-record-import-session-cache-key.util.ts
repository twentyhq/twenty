export const getRecordImportSessionCacheKey = ({
  workspaceId,
  id,
}: {
  workspaceId: string;
  id: string;
}) => `{${workspaceId}}:session:${id}`;

export const getRecordImportEditsCacheKey = (session: {
  workspaceId: string;
  id: string;
}) => `${getRecordImportSessionCacheKey(session)}:edits`;
