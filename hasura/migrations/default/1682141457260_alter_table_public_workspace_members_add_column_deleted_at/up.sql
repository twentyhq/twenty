alter table "public"."workspace_members" add column "deleted_at" timestamptz
 null;

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_deleted_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."deleted_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_workspace_members_deleted_at"
BEFORE UPDATE ON "public"."workspace_members"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_deleted_at"();
COMMENT ON TRIGGER "set_public_workspace_members_deleted_at" ON "public"."workspace_members"
IS 'trigger to set value of column "deleted_at" to current timestamp on row update';
