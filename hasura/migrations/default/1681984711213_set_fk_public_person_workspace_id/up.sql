alter table "public"."person"
  add constraint "person_workspace_id_fkey"
  foreign key ("workspace_id")
  references "public"."workspaces"
  ("id") on update restrict on delete restrict;
