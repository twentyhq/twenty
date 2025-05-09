CREATE TABLE IF NOT EXISTS pageview
(
    `name` LowCardinality(String) NOT NULL,
    `timestamp` DateTime64(3) NOT NULL,
    `userId`      String DEFAULT '',
    `workspaceId` String DEFAULT '',
    `properties`  JSON
)
    ENGINE = MergeTree
        ORDER BY (workspaceId, name, userId, timestamp);