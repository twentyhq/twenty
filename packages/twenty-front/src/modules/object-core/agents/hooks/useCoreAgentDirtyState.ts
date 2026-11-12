import { isDefined } from 'twenty-shared/utils';

import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { coreAgentDraftFamilyState } from '@/object-core/agents/states/coreAgentDraftFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { buildCoreAgentDraft } from '@/object-core/agents/utils/buildCoreAgentDraft';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useCoreAgentDirtyState = (agent: CoreAgent | undefined) => {
  const coreAgentDraft = useAtomFamilyStateValue(
    coreAgentDraftFamilyState,
    agent?.id ?? '',
  );
  const { isRoleDirty } = useCoreAgentRole({
    id: agent?.id ?? '',
    roleId: agent?.roleId,
  });

  const isDraftDirty =
    isDefined(agent) &&
    isDefined(coreAgentDraft) &&
    !isDeeplyEqual(coreAgentDraft, buildCoreAgentDraft(agent));

  return {
    isDraftDirty,
    isRoleDirty: isDefined(agent) && isRoleDirty,
    isDirty: isDraftDirty || (isDefined(agent) && isRoleDirty),
  };
};
