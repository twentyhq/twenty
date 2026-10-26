\set ON_ERROR_STOP on
\timing on
CREATE TEMP TABLE permission_member_sample AS
SELECT md5(member_number::text)::uuid AS member_id, member_number % 10 AS region
FROM generate_series(1,1000) AS member_number;
CREATE TEMP TABLE permission_region_sample AS
SELECT region, array_agg(member_id ORDER BY member_id) AS member_ids,
       ARRAY[md5(('region-' || region)::text)::uuid] AS scope_ids
FROM permission_member_sample GROUP BY region;
CREATE TEMP TABLE expanded_member_permissions AS
SELECT record_number AS record_id, region, member_ids AS readable_by
FROM generate_series(1,100000) AS record_number
JOIN permission_region_sample ON region = record_number % 10;
CREATE TEMP TABLE grouped_scope_permissions AS
SELECT record_number AS record_id, region, scope_ids AS readable_by
FROM generate_series(1,100000) AS record_number
JOIN permission_region_sample ON region = record_number % 10;
CREATE INDEX expanded_member_permissions_readable ON expanded_member_permissions USING gin(readable_by);
CREATE INDEX grouped_scope_permissions_readable ON grouped_scope_permissions USING gin(readable_by);
ANALYZE expanded_member_permissions;
ANALYZE grouped_scope_permissions;
SELECT name, pg_relation_size(name::regclass) AS heap_bytes,
       pg_indexes_size(name::regclass) AS index_bytes,
       pg_total_relation_size(name::regclass) AS total_bytes
FROM (VALUES ('expanded_member_permissions'),('grouped_scope_permissions')) AS comparison(name);
SELECT 'expanded' AS model, count(*) AS matching_rows
FROM expanded_member_permissions WHERE readable_by @> ARRAY[md5('1')::uuid]
UNION ALL
SELECT 'grouped', count(*) FROM grouped_scope_permissions
WHERE readable_by @> ARRAY[md5('region-1')::uuid];
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
UPDATE expanded_member_permissions
SET readable_by = array_append(readable_by, md5('1001')::uuid)
WHERE region = 1;
