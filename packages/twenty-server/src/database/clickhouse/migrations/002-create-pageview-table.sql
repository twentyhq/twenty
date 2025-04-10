CREATE TABLE IF NOT EXISTS pageview
(
    `name` LowCardinality(String)
    `properties`  JSON
    `userId`      String DEFAULT '',
    `workspaceId` String DEFAULT ''
)
    ENGINE = MergeTree
        ORDER BY (name, workspaceId, userId, timestamp);