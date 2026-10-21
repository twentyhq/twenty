CREATE TABLE IF NOT EXISTS messageView
(
    `workspaceId`       UUID,
    `messageCampaignId` UUID,
    `deliveryId`        UUID,
    `eventId`           UUID,
    `occurredAt`        DateTime64(3, 'UTC'),
    `activityClass`     LowCardinality(String)
)
    ENGINE = ReplacingMergeTree
    PARTITION BY toYYYYMM(occurredAt)
    ORDER BY (workspaceId, messageCampaignId, occurredAt, eventId)
    TTL toDateTime(occurredAt) + INTERVAL 3 YEAR DELETE;
