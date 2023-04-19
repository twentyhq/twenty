CREATE TABLE "public"."workspaces" ("id" serial NOT NULL, "name" Text NOT NULL, "display_name" text NOT NULL, PRIMARY KEY ("id") , UNIQUE ("id"), UNIQUE ("name"));
