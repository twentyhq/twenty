CREATE TABLE IF NOT EXISTS billingEvent
(
    `timestamp`          DateTime64(3) NOT NULL,
    `workspaceId`        String NOT NULL,
    `userWorkspaceId`    String DEFAULT '',
    `eventType`          LowCardinality(String) NOT NULL,
    `executionType`      LowCardinality(String) NOT NULL,
    `creditsUsed`        Float64 NOT NULL DEFAULT 0,
    `resourceId`         String DEFAULT '',
    `resourceContext`    String DEFAULT '',
    `metadata`           JSON
)
    ENGINE = MergeTree
    ORDER BY (workspaceId, timestamp, executionType, userWorkspaceId)
    TTL timestamp + INTERVAL 3 YEAR DELETE;
