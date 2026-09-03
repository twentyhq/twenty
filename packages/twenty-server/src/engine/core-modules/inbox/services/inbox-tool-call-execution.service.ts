import { Injectable } from '@nestjs/common';

import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';

export type InboxToolCallExecutionResult =
  | { status: 'EXECUTED'; output: InboxItemPayload }
  | { status: 'FAILED'; error: string };

// The seam between an approved call and the tool executor. Running with the
// approver's context through the executor is the approval-gate work; until it
// lands, running a call records the input it would have run with, so the
// plan's lifecycle can be exercised end to end.
@Injectable()
export class InboxToolCallExecutionService {
  async execute({
    input,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    toolName: string;
    input: InboxItemPayload;
  }): Promise<InboxToolCallExecutionResult> {
    return { status: 'EXECUTED', output: input };
  }
}
