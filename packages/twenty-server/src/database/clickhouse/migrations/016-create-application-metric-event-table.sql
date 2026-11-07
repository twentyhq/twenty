CREATE TABLE IF NOT EXISTS applicationMetricEvent
(
    `timestamp`                 DateTime64(3) NOT NULL,
    `applicationRegistrationId` String NOT NULL,
    `workspaceId`               String NOT NULL,
    `applicationId`             String DEFAULT '',
    `applicationVersion`        String DEFAULT '',
    `source`                    LowCardinality(String) NOT NULL,
    `logicFunctionId`           String DEFAULT '',
    `logicFunctionName`         String DEFAULT '',
    `level`                     LowCardinality(String) NOT NULL,
    `errorCode`                 LowCardinality(String) DEFAULT '',
    `durationMs`                UInt32 DEFAULT 0,
    `occurrenceCount`           UInt32 DEFAULT 1
)
    ENGINE = MergeTree
PARTITION BY toYYYYMM(timestamp)
ORDER BY (applicationRegistrationId, timestamp, workspaceId)
TTL toDateTime(timestamp) + INTERVAL 90 DAY DELETE
SETTINGS ttl_only_drop_parts = 1;
