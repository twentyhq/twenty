CREATE TABLE IF NOT EXISTS events
(
    `action`      LowCardinality(String),
    `timestamp`   DateTime64(3),
    `version`     LowCardinality(String),
    `userId`      String DEFAULT '',
    `workspaceId` String DEFAULT '',
    `payload`     String
)
    ENGINE = MergeTree
        PARTITION BY toYear(timestamp)
        ORDER BY (action, workspaceId, timestamp);