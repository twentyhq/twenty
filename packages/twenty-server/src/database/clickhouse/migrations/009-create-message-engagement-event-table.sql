CREATE TABLE IF NOT EXISTS messageEngagementEvent
(
    `workspaceId`           UUID,
    `messageCampaignId`     UUID,
    `deliveryId`            UUID,
    `recipientEmailHash`    FixedString(64),
    `personId`              UUID,
    `eventId`               UUID,
    `occurredAt`            DateTime64(3, 'UTC'),
    `eventType`             LowCardinality(String),
    `destinationId`         Nullable(UUID),
    `messagePart`           LowCardinality(String),
    `activityClass`         LowCardinality(String),
    `classificationVersion` UInt32,
    `classificationReasons` Array(String),
    `clientFamily`          LowCardinality(String),
    INDEX idx_email recipientEmailHash TYPE bloom_filter GRANULARITY 4,
    INDEX idx_person personId TYPE bloom_filter GRANULARITY 4
)
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(occurredAt)
    ORDER BY (workspaceId, messageCampaignId, occurredAt, eventId)
    TTL toDateTime(occurredAt) + INTERVAL 3 YEAR DELETE;
