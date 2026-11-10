import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { coreAgentDraftFamilyState } from '@/object-core/agents/states/coreAgentDraftFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { UpdateOneAgentDocument } from '~/generated-metadata/graphql';

export const useRenameCoreAgent = (agent: CoreAgent) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const [updateAgent] = useMutation(UpdateOneAgentDocument);
  const setCoreAgentDraft = useSetAtomFamilyState(
    coreAgentDraftFamilyState,
    agent.id,
  );

  const renameCoreAgent = async (label: string) => {
    const trimmedLabel = label.trim();

    if (!isNonEmptyString(trimmedLabel) || trimmedLabel === agent.label) {
      return true;
    }

    const name = computeMetadataNameFromLabel(trimmedLabel);

    if (!isNonEmptyString(name)) {
      enqueueToast({
        status: 'error',
        children: t`Agent name must contain letters or numbers`,
      });

      return false;
    }

    try {
      await updateAgent({
        variables: { input: { id: agent.id, name, label: trimmedLabel } },
      });
      setCoreAgentDraft((currentDraft) =>
        isDefined(currentDraft)
          ? { ...currentDraft, name, label: trimmedLabel }
          : currentDraft,
      );

      return true;
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return false;
    }
  };

  return { renameCoreAgent };
};
