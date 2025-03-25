CREATE TABLE IF NOT EXISTS pageview
(
    `href`        String,
    `locale`      LowCardinality(String),
    `pathname`    String,
    `referrer`    String,
    `sessionId`   String,
    `timeZone`    LowCardinality(String),
    `timestamp`   DateTime64(3),
    `userAgent`   String,
    `userId`      String DEFAULT '',
    `version`     LowCardinality(String),
    `workspaceId` String DEFAULT ''
)
    ENGINE = MergeTree
        PARTITION BY toYear(timestamp)
        ORDER BY (workspaceId, userId, timestamp);