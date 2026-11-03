import { type CoreAgentSettings } from '@/object-core/agents/types/CoreAgentSettings';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentEditSession } from '@/object-core/agents/types/CoreAgentEditSession';
import { getCoreAgentSettings } from '@/object-core/agents/utils/getCoreAgentSettings';
import { isDefined } from 'twenty-shared/utils';
import { getDirtyFields } from '~/utils/getDirtyFields';

export const reconcileCoreAgentEditSession = ({
  session,
  agent,
  hasRoleChanges,
}: {
  session: CoreAgentEditSession | undefined;
  agent: CoreAgent;
  hasRoleChanges: boolean;
}): CoreAgentEditSession => {
  const confirmed = getCoreAgentSettings(agent);

  if (!isDefined(session)) {
    return {
      agent,
      confirmed,
      draft: confirmed,
      fieldRevisions: {
        description: 0,
        prompt: 0,
        modelId: 0,
        modelConfiguration: 0,
        triggers: 0,
      },
      submission: null,
      roleId: agent.roleId ?? null,
      isSaving: false,
      requiresRefresh: false,
      error: null,
      resetVersion: 0,
    };
  }

  const draft = {
    ...confirmed,
    ...getDirtyFields(session.draft, session.confirmed),
  };
  const retainNewerField = <TField extends keyof CoreAgentSettings>(
    field: TField,
  ) => {
    if (
      isDefined(session.submission) &&
      session.fieldRevisions[field] !== session.submission.fieldRevisions[field]
    ) {
      draft[field] = session.draft[field];
    }
  };

  for (const field of [
    'description',
    'prompt',
    'modelId',
    'modelConfiguration',
    'triggers',
  ] as const) {
    retainNewerField(field);
  }

  return {
    ...session,
    agent,
    confirmed,
    draft,
    roleId: hasRoleChanges ? session.roleId : (agent.roleId ?? null),
  };
};
