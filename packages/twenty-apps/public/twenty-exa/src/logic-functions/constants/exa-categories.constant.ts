// Mirrors exa-js's `BaseSearchOptions['category']` union. Kept as a
// runtime list so the tool's JSON-Schema `enum` can reference it.
export const EXA_CATEGORIES = [
  'company',
  'research paper',
  'news',
  'pdf',
  'personal site',
  'financial report',
  'people',
] as const;
