-- Optimize workspaceEvent table for time-series queries
-- ClickHouse doesn't allow changing ORDER BY, so we create a new table and migrate data

-- Step 1: Create new table with optimized structure
CREATE TABLE IF NOT EXISTS workspaceEvent_v2
(
    `event`           LowCardinality(String) NOT NULL,
    `timestamp`       DateTime64(3) NOT NULL,
    `userWorkspaceId` String DEFAULT '',
    `workspaceId`     String NOT NULL,
    `properties`      JSON
)
    ENGINE = MergeTree
    ORDER BY (workspaceId, timestamp, event, userWorkspaceId)
    TTL timestamp + INTERVAL 3 YEAR DELETE;

-- Step 2: Migrate existing data (userWorkspaceId will be empty for historical data)
INSERT INTO workspaceEvent_v2
SELECT event, timestamp, '' as userWorkspaceId, workspaceId, properties
FROM workspaceEvent;

-- Step 3: Atomic swap (EXCHANGE is atomic and instant)
EXCHANGE TABLES workspaceEvent AND workspaceEvent_v2;

-- Step 4: Drop old table (now named workspaceEvent_v2 after swap)
DROP TABLE IF EXISTS workspaceEvent_v2;
