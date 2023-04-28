alter table "public"."companies"
  add constraint "companies_account_owner_id_fkey"
  foreign key ("account_owner_id")
  references "auth"."users"
  ("id") on update set null on delete set null;
