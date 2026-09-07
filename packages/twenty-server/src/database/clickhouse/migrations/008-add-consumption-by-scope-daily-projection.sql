ALTER TABLE usageEvent DROP PROJECTION IF EXISTS consumption_by_scope;

ALTER TABLE usageEvent ADD PROJECTION IF NOT EXISTS consumption_by_scope (
    SELECT
        workspaceId,
        resourceType,
        toStartOfDay(timestamp, 'UTC'),
        operationType,
        userWorkspaceId,
        apiKeyId,
        applicationId,
        agentId,
        workflowId,
        logicFunctionId,
        sum(creditsUsedMicro) AS creditsUsedMicro,
        sum(quantity) AS quantity
    GROUP BY
        workspaceId, resourceType, toStartOfDay(timestamp, 'UTC'), operationType, userWorkspaceId, apiKeyId, applicationId, agentId, workflowId, logicFunctionId
);
