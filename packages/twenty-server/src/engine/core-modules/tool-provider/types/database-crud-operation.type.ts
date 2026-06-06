export type DatabaseCrudOperation =
  | 'find_many'
  | 'find_one'
  | 'create_one'
  | 'create_many'
  | 'update_one'
  | 'update_many'
  | 'upsert_many'
  | 'delete_one'
  | 'delete_many'
  | 'group_by';
