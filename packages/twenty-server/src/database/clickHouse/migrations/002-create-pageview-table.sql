CREATE TABLE IF NOT EXISTS pageview
(
    `name` LowCardinality(String),
    `timestamp` DateTime64(3),
    `userId`      String DEFAULT '',
    `workspaceId` String DEFAULT '',
    `properties`  JSON,
)
    ENGINE = MergeTree
        ORDER BY (workspaceId, name, userId, timestamp);