CREATE TABLE IF NOT EXISTS applicationRegistrationMetric
(
    `timestamp`                 DateTime64(3) NOT NULL,
    `applicationRegistrationId` String NOT NULL,
    `universalIdentifier`       String DEFAULT '',
    `version`                   LowCardinality(String) DEFAULT '',
    `metric`                    LowCardinality(String) NOT NULL,
    `dimension`                 LowCardinality(String) DEFAULT '',
    `context`                   LowCardinality(String) DEFAULT '',
    `workspaceHash`             String DEFAULT '',
    `value`                     Int64 NOT NULL DEFAULT 1
)
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(timestamp)
    ORDER BY (applicationRegistrationId, metric, timestamp, dimension)
    TTL timestamp + INTERVAL 1 YEAR DELETE;
