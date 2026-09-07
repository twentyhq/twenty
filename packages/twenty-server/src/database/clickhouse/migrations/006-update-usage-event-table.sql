CREATE TABLE IF NOT EXISTS
    usageEvent_v2 (
        `timestamp` DateTime64 (3) NOT NULL,
        `workspaceId` String NOT NULL,
        `periodStart` DateTime64 (3),
        `userWorkspaceId` String DEFAULT '',
        `resourceType` LowCardinality (String) NOT NULL,
        `operationType` LowCardinality (String) NOT NULL,
        `quantity` Int64 NOT NULL DEFAULT 0,
        `unit` LowCardinality (String) NOT NULL DEFAULT 'CREDIT',
        `creditsUsedMicro` Int64 NOT NULL DEFAULT 0,
        `resourceId` String DEFAULT '',
        `resourceContext` String DEFAULT '',
        `metadata` JSON
    ) ENGINE = MergeTree
PARTITION BY
    toYYYYMM (timestamp)
ORDER BY
    (workspaceId, timestamp, userWorkspaceId)
PRIMARY KEY (workspaceId, timestamp)
TTL toDateTime(timestamp) + INTERVAL 3 YEAR DELETE;

INSERT INTO
    usageEvent_v2 (timestamp, workspaceId, userWorkspaceId, resourceType, operationType, quantity, unit, creditsUsedMicro, resourceId, resourceContext, metadata)
SELECT
    timestamp,
    workspaceId,
    userWorkspaceId,
    resourceType,
    operationType,
    quantity,
    unit,
    creditsUsedMicro,
    resourceId,
    resourceContext,
    metadata
FROM
    usageEvent;

RENAME TABLE usageEvent TO usageEvent_old;

RENAME TABLE usageEvent_v2 TO usageEvent;

DROP TABLE IF EXISTS usageEvent_old;

ALTER TABLE usageEvent ADD PROJECTION IF NOT EXISTS billing_by_workspace_period (
    SELECT
        workspaceId,
        periodStart,
        sum(creditsUsedMicro) AS totalCreditsUsedMicro
    GROUP BY
        workspaceId, periodStart
);
