CREATE TABLE IF NOT EXISTS events
(
    `event`      LowCardinality(String),
    `timestamp`   DateTime64(3),
    `userId`      String DEFAULT '',
    `workspaceId` String DEFAULT '',
    `properties`  JSON
)
    ENGINE = MergeTree
        ORDER BY (event, workspaceId, timestamp);