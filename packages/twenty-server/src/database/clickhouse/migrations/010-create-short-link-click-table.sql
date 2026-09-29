CREATE TABLE IF NOT EXISTS shortLinkClick
(
    `workspaceId`       UUID,
    `messageCampaignId` UUID,
    `shortLinkId`       UUID,
    `deliveryId`        UUID,
    `eventId`           UUID,
    `occurredAt`        DateTime64(3, 'UTC'),
    `activityClass`     LowCardinality(String)
)
    ENGINE = ReplacingMergeTree
    PARTITION BY toYYYYMM(occurredAt)
    ORDER BY (workspaceId, shortLinkId, occurredAt, eventId)
    TTL toDateTime(occurredAt) + INTERVAL 3 YEAR DELETE;
