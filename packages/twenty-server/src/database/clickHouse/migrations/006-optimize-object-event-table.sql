-- Optimize objectEvent table for time-series queries and object filtering
-- ClickHouse doesn't allow changing ORDER BY, so we create a new table and migrate data

-- Step 1: Create new table with optimized structure
CREATE TABLE IF NOT EXISTS objectEvent_v2
(
    `event`            LowCardinality(String) NOT NULL,
    `timestamp`        DateTime64(3) NOT NULL,
    `userId`           String DEFAULT '',
    `workspaceId`      String NOT NULL,
    `recordId`         String NOT NULL,
    `objectMetadataId` String NOT NULL,
    `properties`       JSON,
    `isCustom`         Boolean DEFAULT FALSE
)
    ENGINE = MergeTree
    ORDER BY (workspaceId, timestamp, objectMetadataId, recordId, event, userId)
    TTL timestamp + INTERVAL 3 YEAR DELETE
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
