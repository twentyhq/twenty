-- Optimize workspaceEvent table for time-series queries
-- ClickHouse doesn't allow changing ORDER BY, so we create a new table and migrate data

-- Step 1: Create new table with optimized structure
CREATE TABLE IF NOT EXISTS workspaceEvent_v2
(
    -- Use efficient codecs for better compression
    `event`       LowCardinality(String) NOT NULL,
    `timestamp`   DateTime64(3) NOT NULL CODEC(Delta, ZSTD(1)),
    `userId`      String DEFAULT '' CODEC(ZSTD(1)),
    `workspaceId` String NOT NULL CODEC(ZSTD(1)),
    `properties`  JSON CODEC(ZSTD(3)),

    -- Skip index for text search on event names
    INDEX event_idx event TYPE tokenbf_v1(10240, 3, 0) GRANULARITY 4,
    -- Bloom filter for userId lookups
    INDEX userId_idx userId TYPE bloom_filter(0.01) GRANULARITY 4
)
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(timestamp)
    ORDER BY (workspaceId, timestamp, event, userId)
    -- Default TTL: 2 years (can be overridden per-workspace via scheduled cleanup)
    TTL timestamp + INTERVAL 2 YEAR DELETE
    SETTINGS
        index_granularity = 8192,
        ttl_only_drop_parts = 1;  -- More efficient: only drop whole parts when all rows expired

-- Step 2: Migrate existing data
INSERT INTO workspaceEvent_v2
SELECT event, timestamp, userId, workspaceId, properties
FROM workspaceEvent;

-- Step 3: Atomic swap (EXCHANGE is atomic and instant)
EXCHANGE TABLES workspaceEvent AND workspaceEvent_v2;

-- Step 4: Drop old table (now named workspaceEvent_v2 after swap)
DROP TABLE IF EXISTS workspaceEvent_v2;
