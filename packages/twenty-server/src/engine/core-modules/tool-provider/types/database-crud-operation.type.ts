export type DatabaseCrudOperation =
  | 'find'
  | 'find_one'
  | 'create'
  | 'create_many'
  | 'update'
  | 'update_many'
  | 'delete';
