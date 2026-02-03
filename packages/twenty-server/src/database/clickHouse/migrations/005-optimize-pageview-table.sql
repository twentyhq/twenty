-- Optimize pageview table for time-series queries
-- ClickHouse doesn't allow changing ORDER BY, so we create a new table and migrate data

-- Step 1: Create new table with optimized structure
CREATE TABLE IF NOT EXISTS pageview_v2
(
    -- Use efficient codecs for better compression
    `name`        LowCardinality(String) NOT NULL,
    `timestamp`   DateTime64(3) NOT NULL CODEC(Delta, ZSTD(1)),
    `userId`      String DEFAULT '' CODEC(ZSTD(1)),
    `workspaceId` String DEFAULT '' CODEC(ZSTD(1)),
    `properties`  JSON CODEC(ZSTD(3)),

    -- Skip index for text search on page names
    INDEX name_idx name TYPE tokenbf_v1(10240, 3, 0) GRANULARITY 4,
    -- Bloom filter for userId lookups
    INDEX userId_idx userId TYPE bloom_filter(0.01) GRANULARITY 4
)
    ENGINE = MergeTree
    PARTITION BY toYYYYMM(timestamp)
    ORDER BY (workspaceId, timestamp, name, userId)
    -- Default TTL: 2 years (can be overridden per-workspace via scheduled cleanup)
    TTL timestamp + INTERVAL 2 YEAR DELETE
    SETTINGS
        index_granularity = 8192,
        ttl_only_drop_parts = 1;

-- Step 2: Migrate existing data
INSERT INTO pageview_v2
SELECT name, timestamp, userId, workspaceId, properties
FROM pageview;

-- Step 3: Atomic swap
EXCHANGE TABLES pageview AND pageview_v2;

-- Step 4: Drop old table
DROP TABLE IF EXISTS pageview_v2;
