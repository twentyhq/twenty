\set ON_ERROR_STOP on
\timing on
CREATE TABLE permission_record (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL,
  name text NOT NULL,
  readable_role_ids uuid[] NOT NULL,
  deleted_at timestamptz
);

INSERT INTO permission_record
SELECT lpad(to_hex(record_number), 32, '0')::uuid,
       '2020-01-01'::timestamptz + record_number * interval '1 second',
       'Synthetic record ' || record_number,
       ARRAY[lpad(to_hex(100000000 + record_number % 1000), 32, '0')::uuid]
       || CASE WHEN record_number % 2 = 0
               THEN ARRAY['00000000-0000-0000-0000-000000000001'::uuid]
               ELSE ARRAY[]::uuid[] END
       || CASE WHEN record_number <= 1000
               THEN ARRAY['00000000-0000-0000-0000-000000000002'::uuid]
               ELSE ARRAY[]::uuid[] END,
       NULL
FROM generate_series(1::bigint, 10000000::bigint) AS record_number;

CREATE INDEX permission_record_created_at ON permission_record (created_at DESC, id DESC)
WHERE deleted_at IS NULL;
CREATE INDEX permission_record_readable_roles ON permission_record USING gin (readable_role_ids)
WHERE deleted_at IS NULL;

CREATE TABLE record_share (
  object_id uuid NOT NULL,
  record_id uuid NOT NULL,
  principal_id uuid NOT NULL,
  access_level text NOT NULL,
  deleted_at timestamptz,
  PRIMARY KEY (object_id, record_id, principal_id)
);

INSERT INTO record_share
SELECT '00000000-0000-0000-0000-000000000010'::uuid,
       lpad(to_hex(share_number * 200), 32, '0')::uuid,
       lpad(to_hex(200000000 + share_number % 100), 32, '0')::uuid,
       'READ', NULL
FROM generate_series(1::bigint, 50000::bigint) AS share_number;

CREATE INDEX record_share_principal ON record_share (principal_id, object_id, record_id)
WHERE deleted_at IS NULL;
VACUUM (ANALYZE) permission_record;
VACUUM (ANALYZE) record_share;
