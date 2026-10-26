\set ON_ERROR_STOP on
\timing on

-- Logged tables preserve WAL and commit costs; no application data is modified.
CREATE TABLE permission_write_record AS
SELECT md5(id::text)::uuid AS id, created_at, name, city,
       repeat(md5(id::text), 8) AS business_payload,
       readable_access_group_ids AS readable,
       readable_access_group_ids AS writable,
       readable_access_group_ids AS soft_deletable,
       readable_access_group_ids AS destroyable,
       readable_access_group_ids AS shareable,
       readable_access_group_ids AS receivable,
       0::integer AS permission_version
FROM permission_company;

ALTER TABLE permission_write_record ADD PRIMARY KEY (id);
CREATE INDEX permission_write_record_created ON permission_write_record (created_at, id);
CREATE INDEX permission_write_record_city ON permission_write_record (city, created_at DESC, id DESC);
CREATE INDEX permission_write_record_name ON permission_write_record (name);
-- Reads need an inverted index; checking an action after a primary-key lookup does not.
CREATE INDEX permission_write_record_readable ON permission_write_record USING gin (readable);

CREATE TABLE permission_write_sidecar AS
SELECT id, readable, writable, soft_deletable, destroyable, shareable, receivable, permission_version
FROM permission_write_record
WHERE created_at < '2020-01-01'::timestamptz + interval '1000001 seconds';
ALTER TABLE permission_write_sidecar ADD PRIMARY KEY (id);
CREATE INDEX permission_write_sidecar_readable ON permission_write_sidecar USING gin (readable);

VACUUM (ANALYZE) permission_write_record;
VACUUM (ANALYZE) permission_write_sidecar;

SELECT relname, reltuples::bigint AS estimated_rows,
       pg_size_pretty(pg_relation_size(oid)) AS heap_size,
       pg_size_pretty(pg_indexes_size(oid)) AS index_size,
       pg_size_pretty(pg_total_relation_size(oid)) AS total_size
FROM pg_class WHERE relname IN ('permission_write_record', 'permission_write_sidecar');
