import { useUpdateCoreAgentEditSession } from '@/object-core/agents/hooks/useUpdateCoreAgentEditSession';
import { useCoreAgentEditScope } from '@/object-core/agents/hooks/useCoreAgentEditScope';
import { type CoreAgentSettings } from '@/object-core/agents/types/CoreAgentSettings';
import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useMemo } from 'react';
import { isFunction } from '@sniptt/guards';

export const useCoreAgentField = <TField extends keyof CoreAgentSettings>({
  field,
  agentId,
}: {
  field: TField;
  agentId?: string;
}) => {
  const { updateCoreAgentEditSession } = useUpdateCoreAgentEditSession({
    agentId,
  });
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
    updateCoreAgentEditSession((session) => {
      const fieldValue = isFunction(nextValue)
        ? nextValue(session.draft[field])
        : nextValue;
      return {
        ...session,
        draft: { ...session.draft, [field]: fieldValue },
        fieldRevisions: {
          ...session.fieldRevisions,
          [field]: session.fieldRevisions[field] + 1,
        },
      };
    });
  };

  return { value, setValue };
};
