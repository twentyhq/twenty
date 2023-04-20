alter table "public"."workspaces" add column "created_at" timestamptz
 not null default now();
