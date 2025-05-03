CREATE TABLE IF NOT EXISTS externalEvent
(
    `event`      LowCardinality(String),
    `timestamp`   DateTime64(3),
    `userId`      String DEFAULT '',
    `workspaceId` String NOT NULL,
    `objectId`    String NOT NULL,
    `objectType`  LowCardinality(String), -- TBC if it should really be a LowCardinality given custom objects
    `properties`  JSON
)
    ENGINE = MergeTree
        ORDER BY (event, workspaceId, userId, timestamp);