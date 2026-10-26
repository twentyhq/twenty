-- city_dense: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000001'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_dense: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000001'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_dense: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000000000001'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_sparse: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_sparse: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_sparse: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_oldest_only: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000002'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_oldest_only: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000002'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_oldest_only: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000000000002'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_overlapping_groups: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000001'::uuid,'00000000-0000-0000-0000-000005f5e12a'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_overlapping_groups: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000001'::uuid,'00000000-0000-0000-0000-000005f5e12a'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_overlapping_groups: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000000000001'::uuid,'00000000-0000-0000-0000-000005f5e12a'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- global_sparse: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- global_sparse: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- global_sparse: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- global_oldest_only: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000002'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- global_oldest_only: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000002'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- global_oldest_only: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000000000002'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_dense_next_page: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND (company.created_at, company.id) < ('2020-04-25T15:53:06+02:00'::timestamptz, '00000000-0000-0000-0000-000000986dd2'::uuid)
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000001'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_dense_next_page: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND (company.created_at, company.id) < ('2020-04-25T15:53:06+02:00'::timestamptz, '00000000-0000-0000-0000-000000986dd2'::uuid)
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000000000001'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_dense_next_page: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND (company.created_at, company.id) < ('2020-04-25T15:53:06+02:00'::timestamptz, '00000000-0000-0000-0000-000000986dd2'::uuid)
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000000000001'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_sparse_next_page: on_record
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND (company.created_at, company.id) < ('2020-02-24T19:50:42+01:00'::timestamptz, '00000000-0000-0000-0000-000000484812'::uuid)
  AND company.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid]
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_sparse_next_page: separate_row
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND (company.created_at, company.id) < ('2020-02-24T19:50:42+01:00'::timestamptz, '00000000-0000-0000-0000-000000484812'::uuid)
  AND EXISTS (SELECT 1 FROM permission_company_access_row AS access WHERE access.record_id = company.id AND access.readable_access_group_ids && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid])
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;

-- city_sparse_next_page: separate_edges
SELECT company.id, company.created_at, company.name, company.city
FROM permission_company AS company
WHERE company.deleted_at IS NULL
  AND company.city = 'City-42'
  AND (company.created_at, company.id) < ('2020-02-24T19:50:42+01:00'::timestamptz, '00000000-0000-0000-0000-000000484812'::uuid)
  AND EXISTS (SELECT 1 FROM permission_company_access_edge AS access WHERE access.record_id = company.id AND access.access_group_id = ANY (ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid]))
ORDER BY company.created_at DESC, company.id DESC
LIMIT 50;
