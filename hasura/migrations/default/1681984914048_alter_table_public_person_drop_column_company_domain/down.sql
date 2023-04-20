alter table "public"."person" alter column "company_domain" drop not null;
alter table "public"."person" add column "company_domain" text;
