import { registerEnumType } from '@nestjs/graphql';

// The ways any item can end. Every item is a plan of zero or more calls, so
// there are only three: all of it ran, some of it was skipped, none of it was
// wanted and it was put away. What the plan was about is in its calls, not in
// a fourth word.
export enum InboxItemOutcome {
  DONE = 'DONE',
  PARTIAL = 'PARTIAL',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(InboxItemOutcome, { name: 'InboxItemOutcome' });
