ALTER TABLE usageEvent ADD PROJECTION IF NOT EXISTS consumption_by_scope (
    SELECT
        workspaceId,
        periodStart,
        resourceType,
        operationType,
        userWorkspaceId,
        apiKeyId,
        applicationId,
        sum(creditsUsedMicro) AS creditsUsedMicro,
        sum(quantity) AS quantity
    GROUP BY
        workspaceId, periodStart, resourceType, operationType, userWorkspaceId, apiKeyId, applicationId
);
