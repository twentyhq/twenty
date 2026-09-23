export const buildWorkspaceWorkflowVersionIdBackfillPredicate = (
  schema: string,
): string => `
  FROM "${schema}"."workflowVersion" wv
  WHERE wv."coreWorkflowVersionId" = cv."id"
    AND wv."deletedAt" IS NULL
    AND cv."workspaceId" = $1
    AND cv."workspaceWorkflowVersionId" IS DISTINCT FROM wv."id"`;
