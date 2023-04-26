CREATE TABLE "public"."people" ("id" uuid NOT NULL, "workspace_id" uuid NOT NULL, "firstname" text, "lastname" text, "email" text, "phone" text, "city" text, "company_id" uuid, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz, PRIMARY KEY ("id") , FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
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
CREATE TRIGGER "set_public_people_updated_at"
BEFORE UPDATE ON "public"."people"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_people_updated_at" ON "public"."people"
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
CREATE TRIGGER "set_public_people_deleted_at"
BEFORE UPDATE ON "public"."people"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_deleted_at"();
COMMENT ON TRIGGER "set_public_people_deleted_at" ON "public"."people"
IS 'trigger to set value of column "deleted_at" to current timestamp on row update';
