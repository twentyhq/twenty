CREATE TABLE "public"."person" ("id" serial NOT NULL, "firstname" text, "lastname" text NOT NULL, "company_domain" text, "phone" text, "city" text, PRIMARY KEY ("id") , UNIQUE ("id"));
