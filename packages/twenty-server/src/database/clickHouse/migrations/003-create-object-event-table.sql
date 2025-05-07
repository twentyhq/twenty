CREATE TABLE IF NOT EXISTS objectEvent
(
    `event`      LowCardinality(String) NOT NULL,
    `timestamp`   DateTime64(3) NOT NULL,
    `userId`      String DEFAULT '',
    `workspaceId` String NOT NULL,
    `recordId`    String NOT NULL,
    `objectMetadataId`  String NOT NULL,
    `properties`  JSON,
    `isCustom`    Boolean DEFAULT FALSE,
)
    ENGINE = MergeTree
        ORDER BY (workspaceId, event, userId, timestamp);