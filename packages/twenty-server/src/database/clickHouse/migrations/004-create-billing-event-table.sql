CREATE TABLE IF NOT EXISTS billingEvent
(
    `eventId`            UUID DEFAULT generateUUIDv4(),
    `timestamp`          DateTime64(3) NOT NULL,
    `workspaceId`        String NOT NULL,
    `userWorkspaceId`    String DEFAULT '',
    `eventType`          LowCardinality(String) NOT NULL,
    `creditsUsed`        Int64 NOT NULL,
    `costInMicroDollars` Int64 DEFAULT 0,
    `resourceType`       LowCardinality(String) DEFAULT '',
    `resourceId`         String DEFAULT '',
    `metadata`           JSON
)
ENGINE = MergeTree
ORDER BY (workspaceId, userWorkspaceId, timestamp, eventType)
TTL timestamp + INTERVAL 3 YEAR DELETE;
