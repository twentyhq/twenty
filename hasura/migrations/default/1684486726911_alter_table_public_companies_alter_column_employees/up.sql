ALTER TABLE "public"."companies" ALTER COLUMN "employees" drop default;
alter table "public"."companies" alter column "employees" drop not null;
