-- Optimize objectEvent table for time-series queries and object filtering
-- ClickHouse doesn't allow changing ORDER BY, so we create a new table and migrate data

-- Step 1: Create new table with optimized structure
CREATE TABLE IF NOT EXISTS objectEvent_v2
(
    -- Use efficient codecs for better compression
    `event`            LowCardinality(String) NOT NULL,
    `timestamp`        DateTime64(3) NOT NULL CODEC(Delta, ZSTD(1)),
    `userId`           String DEFAULT '' CODEC(ZSTD(1)),
    `workspaceId`      String NOT NULL CODEC(ZSTD(1)),
    `recordId`         String NOT NULL CODEC(ZSTD(1)),
    `objectMetadataId` String NOT NULL CODEC(ZSTD(1)),
    `properties`       JSON CODEC(ZSTD(3)),
    `isCustom`         Boolean DEFAULT FALSE,

    -- Skip index for text search on event names
    INDEX event_idx event TYPE tokenbf_v1(10240, 3, 0) GRANULARITY 4,
    -- Bloom filter for common lookups
    INDEX userId_idx userId TYPE bloom_filter(0.01) GRANULARITY 4,
    INDEX recordId_idx recordId TYPE bloom_filter(0.01) GRANULARITY 4,
    INDEX objectMetadataId_idx objectMetadataId TYPE bloom_filter(0.01) GRANULARITY 4
)
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(timestamp)
    ORDER BY (workspaceId, timestamp, objectMetadataId, recordId, event, userId)
    -- Default TTL: 2 years (can be overridden per-workspace via scheduled cleanup)
    TTL timestamp + INTERVAL 2 YEAR DELETE
    SETTINGS
        index_granularity = 8192,
        ttl_only_drop_parts = 1;

-- Step 2: Migrate existing data
INSERT INTO objectEvent_v2
SELECT event, timestamp, userId, workspaceId, recordId, objectMetadataId, properties, isCustom
FROM objectEvent;

-- Step 3: Atomic swap
EXCHANGE TABLES objectEvent AND objectEvent_v2;

-- Step 4: Drop old table
DROP TABLE IF EXISTS objectEvent_v2;
