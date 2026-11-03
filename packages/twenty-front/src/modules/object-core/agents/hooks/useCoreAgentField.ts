import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { type CoreAgentSettings } from '@/object-core/agents/types/CoreAgentSettings';
import { useAtomValue, useStore } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isFunction } from '@sniptt/guards';

export const useCoreAgentField = <TField extends keyof CoreAgentSettings>({
  field,
  agentId,
}: {
  field: TField;
  agentId?: string;
}) => {
  const store = useStore();
  const { sessionAtom } = useCoreAgentEditScope(agentId);
  const fieldAtom = useMemo(
    () => selectAtom(sessionAtom, (session) => session?.draft[field]),
    [sessionAtom, field],
  );
  const value = useAtomValue(fieldAtom);

  const setValue = (
    nextValue:
      | CoreAgentSettings[TField]
      | ((
          previousValue: CoreAgentSettings[TField],
        ) => CoreAgentSettings[TField]),
  ) => {
    const session = store.get(sessionAtom);

    if (
      !isDefined(session) ||
      session.agent.isSystem ||
      !store.get(permissionFlagMapSelector.atom)[
        PermissionFlagType.AI_SETTINGS
      ] ||
      !getIsMetadataItemCustom(
        session.agent,
        store.get(currentWorkspaceState.atom)?.workspaceCustomApplication?.id,
      )
    ) {
      return;
    }

    const fieldValue = isFunction(nextValue)
      ? nextValue(session.draft[field])
      : nextValue;
    store.set(sessionAtom, {
      ...session,
      draft: { ...session.draft, [field]: fieldValue },
      fieldRevisions: {
        ...session.fieldRevisions,
        [field]: session.fieldRevisions[field] + 1,
      },
    });
  };

  return { value, setValue };
};
