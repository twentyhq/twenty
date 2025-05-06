CREATE TABLE IF NOT EXISTS workspaceEvent
(
    `event`      LowCardinality(String),
    `timestamp`   DateTime64(3),
    `userId`      String DEFAULT '',
    `workspaceId` String NOT NULL,
    `properties`  JSON
)
    ENGINE = MergeTree
        ORDER BY (workspaceId, event, userId, timestamp);