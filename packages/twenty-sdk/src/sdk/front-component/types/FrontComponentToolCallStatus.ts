// Mirrors the chat runtime's tool part states. A proposed call the component renders for the
// person to decide is approval-requested.
export type FrontComponentToolCallStatus =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-denied'
  | 'output-error';
