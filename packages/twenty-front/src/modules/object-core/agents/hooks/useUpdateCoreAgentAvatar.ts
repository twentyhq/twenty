import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { coreAgentDraftFamilyState } from '@/object-core/agents/states/coreAgentDraftFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { UpdateOneAgentDocument } from '~/generated-metadata/graphql';

type CoreAgentAvatar = Pick<CoreAgent, 'avatarColor' | 'avatarShape'>;

export const useUpdateCoreAgentAvatar = (agent: CoreAgent) => {
  const { enqueueToast } = useToast();
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const setCoreAgentDraft = useSetAtomFamilyState(
    coreAgentDraftFamilyState,
    agent.id,
  );

  const setDraftAvatar = (avatar: CoreAgentAvatar) =>
    setCoreAgentDraft((currentDraft) =>
      isDefined(currentDraft) ? { ...currentDraft, ...avatar } : currentDraft,
    );

  const updateCoreAgentAvatar = async (avatar: CoreAgentAvatar) => {
    const persistedAvatar = {
      avatarColor: agent.avatarColor,
      avatarShape: agent.avatarShape,
    };

    setDraftAvatar(avatar);

    try {
      await updateAgent({
        variables: { input: { id: agent.id, ...avatar } },
        optimisticResponse: { updateOneAgent: { ...agent, ...avatar } },
      });
    } catch (error) {
      setDraftAvatar(persistedAvatar);
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { updateCoreAgentAvatar };
};
