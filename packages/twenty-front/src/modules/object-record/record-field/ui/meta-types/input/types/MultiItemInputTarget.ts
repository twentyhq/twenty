export type MultiItemInputTarget =
  | { type: 'closed' }
  | { type: 'new-item' }
  | { type: 'existing-item'; itemIndex: number };
