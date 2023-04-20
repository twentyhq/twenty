alter table "public"."person"
  add constraint "person_company_id_fkey"
  foreign key ("company_id")
  references "public"."company"
  ("id") on update restrict on delete restrict;
