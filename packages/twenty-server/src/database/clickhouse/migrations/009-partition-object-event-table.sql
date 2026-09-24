CREATE TABLE IF NOT EXISTS
    objectEvent_v2 (
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
PARTITION BY
    toYYYYMM (timestamp)
ORDER BY
    (workspaceId, timestamp, event, userId)
TTL toDateTime(timestamp) + INTERVAL 3 YEAR DELETE
SETTINGS
    ttl_only_drop_parts = 1,
    -- merging the `properties` JSON column has a large fixed cost per merge, so the
    -- default 150 GiB ceiling lets the scheduler pick merges that cannot fit in RAM
    max_bytes_to_merge_at_max_space_in_pool = 209715200;

ALTER TABLE
    objectEvent
    -- the cap is per table and follows it through the swap, so applying it here is
    -- what stops the backup retrying the same oversized merge during the backfill
    MODIFY SETTING max_bytes_to_merge_at_max_space_in_pool = 209715200;

EXCHANGE TABLES
    -- swapping before the copy freezes the source, so no event written while the
    -- backfill runs can be lost. EXCHANGE is atomic, a two-pair RENAME is not
    objectEvent AND objectEvent_v2;

RENAME TABLE
    -- objectEvent_v2 now holds the pre-migration data and nothing reads that name
    objectEvent_v2 TO objectEvent_backup_drop_manually_after_check;

INSERT INTO
    objectEvent (event, timestamp, userId, workspaceId, recordId, objectMetadataId, properties, isCustom)
SELECT
    event,
    timestamp,
    userId,
    workspaceId,
    recordId,
    objectMetadataId,
    properties,
    isCustom
FROM
    objectEvent_backup_drop_manually_after_check;
