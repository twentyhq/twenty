export type ToolOperation = 'find' | 'create' | 'update' | 'delete';

export interface ToolHints {
  // Object names (singular or plural) that are relevant to the query
  relevantObjects?: string[];
  // Specific CRUD operations needed for the query
  operations?: ToolOperation[];
}
