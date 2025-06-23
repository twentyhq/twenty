CREATE TABLE IF NOT EXISTS workspaceEvent
(
    `event`      LowCardinality(String) NOT NULL,
    `timestamp`   DateTime64(3) NOT NULL,
    `userId`      String DEFAULT '',
    `workspaceId` String NOT NULL,
    `properties`  JSON
)
    ENGINE = MergeTree
        ORDER BY (workspaceId, event, userId, timestamp);