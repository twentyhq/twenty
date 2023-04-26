CREATE TABLE "public"."workspaces" ("id" uuid NOT NULL, "domain_name" text NOT NULL, "display_name" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz, PRIMARY KEY ("id") , UNIQUE ("domain_name"), UNIQUE ("id"));
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_workspaces_updated_at"
BEFORE UPDATE ON "public"."workspaces"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_workspaces_updated_at" ON "public"."workspaces"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

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
CREATE TRIGGER "set_public_workspaces_deleted_at"
BEFORE UPDATE ON "public"."workspaces"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_deleted_at"();
COMMENT ON TRIGGER "set_public_workspaces_deleted_at" ON "public"."workspaces"
IS 'trigger to set value of column "deleted_at" to current timestamp on row update';
