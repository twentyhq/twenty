CREATE TABLE IF NOT EXISTS usageEvent
(
    `timestamp`          DateTime64(3) NOT NULL,
    `workspaceId`        String NOT NULL,
    `userWorkspaceId`    String DEFAULT '',
    `resourceType`       LowCardinality(String) NOT NULL,
    `operationType`      LowCardinality(String) NOT NULL,
    `quantity`           Int64 NOT NULL DEFAULT 0,
    `unit`               LowCardinality(String) NOT NULL DEFAULT 'CREDIT',
    `creditsUsedMicro`   Int64 NOT NULL DEFAULT 0,
    `resourceId`         String DEFAULT '',
    `resourceContext`    String DEFAULT '',
    `metadata`           JSON
)
    ENGINE = MergeTree
    ORDER BY (workspaceId, timestamp, resourceType, operationType, userWorkspaceId, resourceId)
    TTL timestamp + INTERVAL 3 YEAR DELETE;
