CREATE TABLE IF NOT EXISTS pageview
(
    `name` LowCardinality(String),
    `timestamp` DateTime64(3),
    `properties`  JSON,
    `userId`      String DEFAULT '',
    `workspaceId` String DEFAULT ''
)
ENGINE = MergeTree
ORDER BY (name, workspaceId, userId, timestamp)
SETTINGS index_granularity = 8192
SETTINGS allow_experimental_json_type = 1;