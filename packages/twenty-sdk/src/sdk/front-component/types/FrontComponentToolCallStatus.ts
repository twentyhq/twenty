// Mirrors the chat runtime's tool part states. A proposed call waiting on the person's decision is
// approval-requested: the component can stage its arguments with updateToolCallArguments.
export type FrontComponentToolCallStatus =
  | 'input-streaming'
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-denied'
  | 'output-error';
