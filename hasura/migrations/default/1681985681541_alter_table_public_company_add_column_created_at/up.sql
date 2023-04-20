alter table "public"."company" add column "created_at" timestamptz
 null default now();
