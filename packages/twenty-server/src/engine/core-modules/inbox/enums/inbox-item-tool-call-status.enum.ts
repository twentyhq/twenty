import { registerEnumType } from '@nestjs/graphql';

// Where a proposed call stands. Proposed and rejected are the person's
// decision; executed and failed are what happened when the plan ran.
export enum InboxItemToolCallStatus {
  PROPOSED = 'PROPOSED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
}

registerEnumType(InboxItemToolCallStatus, { name: 'InboxItemToolCallStatus' });
