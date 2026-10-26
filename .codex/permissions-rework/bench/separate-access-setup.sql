\set ON_ERROR_STOP on
\timing on

-- Keep the original benchmark and the application's database untouched.
CREATE TABLE permission_company AS
SELECT id, created_at, name,
       'City-' || ((hashtextextended(id::text, 42) % 100 + 100) % 100) AS city,
       readable_role_ids AS readable_access_group_ids,
       deleted_at
FROM permission_record;

ALTER TABLE permission_company ADD PRIMARY KEY (id);
CREATE INDEX permission_company_city_order
  ON permission_company (city, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX permission_company_order
  ON permission_company (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX permission_company_access
  ON permission_company USING gin (readable_access_group_ids)
  WHERE deleted_at IS NULL;

CREATE TABLE permission_company_access_row AS
SELECT id AS record_id, readable_access_group_ids
FROM permission_company;
ALTER TABLE permission_company_access_row ADD PRIMARY KEY (record_id);
CREATE INDEX permission_company_access_row_groups
  ON permission_company_access_row USING gin (readable_access_group_ids);

-- One action and one object isolate the cost of access representation.
CREATE TABLE permission_company_access_edge AS
SELECT company.id AS record_id, access_group_id
FROM permission_company AS company
CROSS JOIN LATERAL unnest(company.readable_access_group_ids) AS access_group_id;
ALTER TABLE permission_company_access_edge ADD PRIMARY KEY (record_id, access_group_id);
CREATE INDEX permission_company_access_edge_group
  ON permission_company_access_edge (access_group_id, record_id);
ALTER TABLE permission_company_access_edge ALTER COLUMN access_group_id SET STATISTICS 1000;
ALTER TABLE permission_company_access_row ALTER COLUMN readable_access_group_ids SET STATISTICS 1000;
ALTER TABLE permission_company ALTER COLUMN readable_access_group_ids SET STATISTICS 1000;

VACUUM (ANALYZE) permission_company;
VACUUM (ANALYZE) permission_company_access_row;
VACUUM (ANALYZE) permission_company_access_edge;

SELECT relname, reltuples::bigint AS estimated_rows,
       pg_size_pretty(pg_relation_size(oid)) AS heap_size,
       pg_size_pretty(pg_indexes_size(oid)) AS index_size,
       pg_size_pretty(pg_total_relation_size(oid)) AS total_size
FROM pg_class
WHERE relname IN ('permission_company', 'permission_company_access_row', 'permission_company_access_edge');
