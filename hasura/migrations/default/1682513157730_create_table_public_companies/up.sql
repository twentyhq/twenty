CREATE TABLE "public"."companies" ("id" uuid NOT NULL, "workspace_id" uuid NOT NULL, "name" text, "domain_name" text, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), "deleted_at" timestamptz DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("id"));
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
CREATE TRIGGER "set_public_companies_updated_at"
BEFORE UPDATE ON "public"."companies"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_companies_updated_at" ON "public"."companies"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
