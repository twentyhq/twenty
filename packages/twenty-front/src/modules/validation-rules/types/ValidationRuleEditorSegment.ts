export type ValidationRuleEditorSegment =
  | { type: 'text'; text: string }
  | { type: 'field'; path: string };
