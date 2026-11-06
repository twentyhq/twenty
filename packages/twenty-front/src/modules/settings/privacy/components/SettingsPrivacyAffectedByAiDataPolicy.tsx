import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import {
  AI_MODEL_TIERS,
  isAiDataPolicyActive,
  isAiModelCompliantWithDataPolicy,
  parseAiModelVariantId,
} from 'twenty-shared/ai';
import {
  isAutoSelectModelId,
  isDefined,
  isNonEmptyString,
} from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

export const SettingsPrivacyAffectedByAiDataPolicy = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const aiModels = useAtomStateValue(aiModelsState);
  const aiDataPolicy = getWorkspaceAiDataPolicy(currentWorkspace);
  const isPolicyActive = isAiDataPolicyActive(aiDataPolicy);

  const { data } = useQuery(FindManyAgentsDocument, { skip: !isPolicyActive });

  if (!isPolicyActive) {
    return null;
  }

  const isModelExcluded = (modelVariantId: string) => {
    const { modelId } = parseAiModelVariantId(modelVariantId);
    const model = aiModels.find((aiModel) => aiModel.modelId === modelId);

    return (
      !isDefined(model) ||
      !isAiModelCompliantWithDataPolicy({ model, aiDataPolicy })
    );
  };

  const agentLabels = (data?.findManyAgents ?? [])
    .filter(
      ({ modelId }) =>
        isDefined(modelId) &&
        !isAutoSelectModelId(modelId) &&
        isModelExcluded(modelId),
    )
    .map(({ label }) => label)
    .join(', ');

  const pinnedTiers = currentWorkspace?.isAutoModelSelectionEnabled
    ? []
    : AI_MODEL_TIERS.filter((tier) => {
        const pinnedModelId = currentWorkspace?.aiModelIdByTier?.[tier];

        return (
          isNonEmptyString(pinnedModelId) && isModelExcluded(pinnedModelId)
        );
      });
  const pinnedTierLabels = pinnedTiers.map(getAiModelTierLabel).join(', ');

  const warningIcon = (
    <IconAlertTriangle
      size={themeCssVariables.icon.size.md}
      aria-hidden="true"
    />
  );

  return (
    <>
      {isNonEmptyString(agentLabels) && (
        <Callout
          fullWidth
          status="warning"
          icon={warningIcon}
          title={t`Agents that will fail`}
          description={t`These agents use a model your settings exclude, so they fail when they run: ${agentLabels}`}
        />
      )}
      {isNonEmptyString(pinnedTierLabels) && (
        <Callout
          fullWidth
          status="warning"
          icon={warningIcon}
          title={t`Pinned models not in use`}
          description={t`These tiers fall back to an allowed model: ${pinnedTierLabels}`}
        />
      )}
    </>
  );
};
