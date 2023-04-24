alter table "public"."workspace_members" add column "created_at" timestamptz
 not null default now();
