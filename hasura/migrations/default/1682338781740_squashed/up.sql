
CREATE TABLE "public"."workspace_members" ("id" serial NOT NULL, "user_id" uuid NOT NULL, "workspace_id" integer NOT NULL, PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"), UNIQUE ("user_id"));

alter table "public"."workspace_members" add column "created_at" timestamptz
 not null default now();

alter table "public"."workspace_members" add column "updated_at" timestamptz
 not null default now();

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
CREATE TRIGGER "set_public_workspace_members_updated_at"
BEFORE UPDATE ON "public"."workspace_members"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_workspace_members_updated_at" ON "public"."workspace_members"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

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

alter table "public"."workspaces" add column "domain_name" text
 null unique;

alter table "public"."workspaces" drop column "domain_name" cascade;

alter table "public"."workspaces" rename column "name" to "domain_name";

alter table "public"."workspaces" add column "deleted_at" Timestamp
 null;
