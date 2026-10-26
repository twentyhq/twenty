\set ON_ERROR_STOP on
\pset pager off
SET statement_timeout = '45s';
SELECT version(), current_setting('shared_buffers'), current_setting('work_mem');
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables ORDER BY relname;

\echo baseline_top_50
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, name FROM permission_record WHERE deleted_at IS NULL
ORDER BY created_at DESC, id DESC LIMIT 50;

\echo dense_role_top_50
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, name FROM permission_record WHERE deleted_at IS NULL
AND readable_role_ids @> ARRAY['00000000-0000-0000-0000-000000000001'::uuid]
ORDER BY created_at DESC, id DESC LIMIT 50;

\echo scattered_role_top_50
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, name FROM permission_record WHERE deleted_at IS NULL
AND readable_role_ids @> ARRAY[lpad(to_hex(100000000), 32, '0')::uuid]
ORDER BY created_at DESC, id DESC LIMIT 50;

\echo oldest_records_role_top_50
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, name FROM permission_record WHERE deleted_at IS NULL
AND readable_role_ids @> ARRAY['00000000-0000-0000-0000-000000000002'::uuid]
ORDER BY created_at DESC, id DESC LIMIT 50;

\echo shared_only_uncorrelated_top_50
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, name FROM permission_record WHERE deleted_at IS NULL
AND id = ANY(ARRAY(SELECT record_id FROM record_share
  WHERE object_id='00000000-0000-0000-0000-000000000010'
  AND principal_id=lpad(to_hex(200000000), 32, '0')::uuid
  AND access_level IN ('READ', 'READ_WRITE', 'FULL') AND deleted_at IS NULL))
ORDER BY created_at DESC, id DESC LIMIT 50;

\echo role_or_shared_correlated_top_50
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, name FROM permission_record AS record WHERE deleted_at IS NULL
AND (readable_role_ids @> ARRAY['00000000-0000-0000-0000-000000000002'::uuid]
OR EXISTS (SELECT 1 FROM record_share AS share
  WHERE share.record_id=record.id
  AND object_id='00000000-0000-0000-0000-000000000010'
  AND principal_id=lpad(to_hex(200000000), 32, '0')::uuid
  AND access_level IN ('READ', 'READ_WRITE', 'FULL') AND share.deleted_at IS NULL))
ORDER BY created_at DESC, id DESC LIMIT 50;

\echo role_or_shared_uncorrelated_top_50
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT id, name FROM permission_record WHERE deleted_at IS NULL
AND (readable_role_ids @> ARRAY['00000000-0000-0000-0000-000000000002'::uuid]
OR id = ANY(ARRAY(SELECT record_id FROM record_share
  WHERE object_id='00000000-0000-0000-0000-000000000010'
  AND principal_id=lpad(to_hex(200000000), 32, '0')::uuid
  AND access_level IN ('READ', 'READ_WRITE', 'FULL') AND deleted_at IS NULL)))
ORDER BY created_at DESC, id DESC LIMIT 50;

\echo dense_role_exact_count
EXPLAIN (ANALYZE, BUFFERS, TIMING OFF)
SELECT count(*) FROM permission_record WHERE deleted_at IS NULL
AND readable_role_ids @> ARRAY['00000000-0000-0000-0000-000000000001'::uuid];
