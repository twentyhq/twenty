ALTER TABLE usageEvent ADD PROJECTION IF NOT EXISTS billing_by_workspace_operation_period (
    SELECT
        workspaceId,
        periodStart,
        operationType,
        sum(creditsUsedMicro) AS totalCreditsUsedMicro
    GROUP BY
        workspaceId, periodStart, operationType
);

ALTER TABLE usageEvent MATERIALIZE PROJECTION billing_by_workspace_operation_period;

ALTER TABLE usageEvent DROP PROJECTION IF EXISTS billing_by_workspace_period;
