import { isDefined } from 'twenty-shared/utils';

import { type AgentChatRecordTarget } from '@/ai/types/AgentChatRecordTarget';

export const movePendingRecordTargetToDraftKey = ({
  pendingRecordTargetByDraftKey,
  fromDraftKey,
  toDraftKey,
}: {
  pendingRecordTargetByDraftKey: Record<string, AgentChatRecordTarget>;
  fromDraftKey: string;
  toDraftKey: string;
}): Record<string, AgentChatRecordTarget> => {
  const { [fromDraftKey]: pendingRecordTarget, ...otherPendingRecordTargets } =
    pendingRecordTargetByDraftKey;

  return isDefined(pendingRecordTarget)
    ? { ...otherPendingRecordTargets, [toDraftKey]: pendingRecordTarget }
    : otherPendingRecordTargets;
};
