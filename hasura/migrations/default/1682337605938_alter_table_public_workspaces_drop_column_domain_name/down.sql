alter table "public"."workspaces" add constraint "workspaces_domain_name_key" unique (domain_name);
alter table "public"."workspaces" alter column "domain_name" drop not null;
alter table "public"."workspaces" add column "domain_name" text;
