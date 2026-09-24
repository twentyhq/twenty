// Maps everyday verbs onto the operation tokens used in tool names, so
// "list companies" reaches find_many_companies.
export const TOOL_SEARCH_VERB_SYNONYMS: Record<string, string> = {
  list: 'find',
  search: 'find',
  get: 'find',
  fetch: 'find',
  show: 'find',
  add: 'create',
  new: 'create',
  insert: 'create',
  edit: 'update',
  change: 'update',
  modify: 'update',
  remove: 'delete',
  count: 'group',
  aggregate: 'group',
  stats: 'group',
  metrics: 'group',
};
