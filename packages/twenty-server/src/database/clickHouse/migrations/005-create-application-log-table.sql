CREATE TABLE IF NOT EXISTS applicationLog
(
    `timestamp`         DateTime64(3) NOT NULL,
    `workspaceId`       String NOT NULL,
    `applicationId`     String DEFAULT '',
    `logicFunctionId`   String DEFAULT '',
    `logicFunctionName` String DEFAULT '',
    `executionId`       String DEFAULT '',
    `level`             LowCardinality(String) DEFAULT 'INFO',
    `message`           String NOT NULL,
    `properties`        JSON
)
    ENGINE = MergeTree
    ORDER BY (workspaceId, timestamp, applicationId, logicFunctionId)
    TTL timestamp + INTERVAL 30 DAY DELETE;
