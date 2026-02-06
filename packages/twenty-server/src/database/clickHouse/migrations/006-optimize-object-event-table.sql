-- Optimize objectEvent table for time-series queries and object filtering
-- ClickHouse doesn't allow changing ORDER BY, so we create a new table and migrate data

-- Step 1: Create new table with optimized structure
CREATE TABLE IF NOT EXISTS objectEvent_v2
(
    `event`            LowCardinality(String) NOT NULL,
    `timestamp`        DateTime64(3) NOT NULL,
    `userWorkspaceId`  String DEFAULT '',
    `workspaceId`      String NOT NULL,
    `recordId`         String NOT NULL,
    `objectMetadataId` String NOT NULL,
    `properties`       JSON,
    `isCustom`         Boolean DEFAULT FALSE
)
    ENGINE = MergeTree
    ORDER BY (workspaceId, timestamp, objectMetadataId, recordId, event, userWorkspaceId)
    TTL timestamp + INTERVAL 3 YEAR DELETE;

-- Step 2: Migrate existing data (userWorkspaceId will be empty for historical data)
INSERT INTO objectEvent_v2
SELECT event, timestamp, '' as userWorkspaceId, workspaceId, recordId, objectMetadataId, properties, isCustom
FROM objectEvent;

-- Step 3: Atomic swap
EXCHANGE TABLES objectEvent AND objectEvent_v2;

-- Step 4: Drop old table
DROP TABLE IF EXISTS objectEvent_v2;
