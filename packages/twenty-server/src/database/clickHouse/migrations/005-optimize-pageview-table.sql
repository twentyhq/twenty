-- Optimize pageview table for time-series queries
-- ClickHouse doesn't allow changing ORDER BY, so we create a new table and migrate data

-- Step 1: Create new table with optimized structure
CREATE TABLE IF NOT EXISTS pageview_v2
(
    `name`            LowCardinality(String) NOT NULL,
    `timestamp`       DateTime64(3) NOT NULL,
    `userWorkspaceId` String DEFAULT '',
    `workspaceId`     String DEFAULT '',
    `properties`      JSON
)
    ENGINE = MergeTree
    ORDER BY (workspaceId, timestamp, name, userWorkspaceId)
    TTL timestamp + INTERVAL 3 YEAR DELETE;

-- Step 2: Migrate existing data (userWorkspaceId will be empty for historical data)
INSERT INTO pageview_v2
SELECT name, timestamp, '' as userWorkspaceId, workspaceId, properties
FROM pageview;

-- Step 3: Atomic swap
EXCHANGE TABLES pageview AND pageview_v2;

-- Step 4: Drop old table
DROP TABLE IF EXISTS pageview_v2;
