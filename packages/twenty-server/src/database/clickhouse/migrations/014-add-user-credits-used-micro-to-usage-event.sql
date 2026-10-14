ALTER TABLE usageEvent ADD COLUMN IF NOT EXISTS userCreditsUsedMicro Int64 DEFAULT 0;

ALTER TABLE usageEvent DROP PROJECTION IF EXISTS consumption_by_scope;

ALTER TABLE usageEvent ADD PROJECTION IF NOT EXISTS consumption_by_scope (
    SELECT
        workspaceId,
        resourceType,
        toStartOfDay(timestamp, 'UTC'),
        operationType,
        unit,
        userWorkspaceId,
        apiKeyId,
        applicationId,
        agentId,
        workflowId,
        logicFunctionId,
        sum(creditsUsedMicro) AS creditsUsedMicro,
        sum(userCreditsUsedMicro) AS userCreditsUsedMicro,
        sum(quantity) AS quantity
    GROUP BY
        workspaceId, resourceType, toStartOfDay(timestamp, 'UTC'), operationType, unit, userWorkspaceId, apiKeyId, applicationId, agentId, workflowId, logicFunctionId
);

ALTER TABLE usageEvent DROP PROJECTION IF EXISTS billing_by_workspace_period;

ALTER TABLE usageEvent ADD PROJECTION IF NOT EXISTS billing_by_workspace_period (
    SELECT
        workspaceId,
        periodStart,
        sum(creditsUsedMicro) AS totalCreditsUsedMicro,
        sum(userCreditsUsedMicro) AS userCreditsUsedMicro
    GROUP BY
        workspaceId, periodStart
);
