export type SlackAccessDecision =
  | { status: 'ALLOWED' }
  | { status: 'DENIED' }
  | { status: 'UNVERIFIABLE' };
