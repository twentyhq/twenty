CREATE TABLE IF NOT EXISTS pageview
(
    `name` LowCardinality(String),
    `timestamp` DateTime64(3),
    `properties`  JSON,
    `userId`      String DEFAULT '',
    `workspaceId` String DEFAULT ''
)
    ENGINE = MergeTree
        ORDER BY (name, workspaceId, userId, timestamp);
