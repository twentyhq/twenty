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
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(occurredAt)
    ORDER BY (workspaceId, messageCampaignId, shortLinkId, occurredAt)
    TTL toDateTime(occurredAt) + INTERVAL 3 YEAR DELETE;
