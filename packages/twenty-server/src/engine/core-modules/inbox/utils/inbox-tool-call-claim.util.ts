import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, Or } from 'typeorm';

import { type InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';

// A claim older than this belongs to a run that died between claiming and
// finishing, so the next run may take the call over rather than wait forever.
export const TOOL_CALL_CLAIM_TIMEOUT_MS = 10 * 60 * 1000;

const getClaimCutoff = () => new Date(Date.now() - TOOL_CALL_CLAIM_TIMEOUT_MS);

// The one definition of what a run may claim and what a new plan may replace.
export const buildClaimableToolCallPredicate = () => ({
  status: InboxItemToolCallStatus.PROPOSED,
  resolvedAt: Or(IsNull(), LessThan(getClaimCutoff())),
});

export const isToolCallHeldByClaim = (
  toolCall: InboxItemToolCallEntity,
  claimedAt: Date,
) =>
  toolCall.status === InboxItemToolCallStatus.PROPOSED &&
  isDefined(toolCall.resolvedAt) &&
  toolCall.resolvedAt.getTime() === claimedAt.getTime();

export const isToolCallRunning = (toolCall: InboxItemToolCallEntity) =>
  toolCall.status === InboxItemToolCallStatus.PROPOSED &&
  isDefined(toolCall.resolvedAt) &&
  toolCall.resolvedAt >= getClaimCutoff();
