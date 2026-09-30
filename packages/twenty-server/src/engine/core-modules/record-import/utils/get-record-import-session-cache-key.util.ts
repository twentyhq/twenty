export const getRecordImportSessionCacheKey = ({
  workspaceId,
  id,
}: {
  workspaceId: string;
  id: string;
}) => `{${workspaceId}}:session:${id}`;
