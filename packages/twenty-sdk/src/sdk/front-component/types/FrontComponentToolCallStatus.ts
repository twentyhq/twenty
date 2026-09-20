// Mirrors the tool part states the chat runtime emits, approval states
// included, so a widget can render a call at any point in its life.
export type FrontComponentToolCallStatus =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-denied'
  | 'output-error';
