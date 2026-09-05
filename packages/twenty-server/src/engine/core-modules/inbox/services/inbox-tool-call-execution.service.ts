import { Injectable } from '@nestjs/common';

import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';

export type InboxToolCallExecutionResult =
  | { status: 'EXECUTED'; output: InboxItemToolCallInput }
  | { status: 'FAILED'; error: string };

// Running with the approver's context through the tool executor is the
// approval-gate work. Until it lands, running a call records the input it would
// have run with, so the plan's lifecycle can be exercised end to end.
@Injectable()
export class InboxToolCallExecutionService {
  async execute({
    input,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    toolName: string;
    input: InboxItemToolCallInput;
  }): Promise<InboxToolCallExecutionResult> {
    return { status: 'EXECUTED', output: input };
  }
}
