import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  isAiDataPolicyActive,
  isAiModelCompliantWithDataPolicy,
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
import {
  type AiModelTier,
  FindManyAgentsDocument,
} from '~/generated-metadata/graphql';

const StyledCalloutContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

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

  const isModelExcluded = (modelId: string) =>
    !isAiModelCompliantWithDataPolicy({
      model: aiModels.find((model) => model.modelId === modelId) ?? {},
      aiDataPolicy,
    });

  const agentLabels = (data?.findManyAgents ?? [])
    .filter(
      ({ modelId }) =>
        isDefined(modelId) &&
        !isAutoSelectModelId(modelId) &&
        isModelExcluded(modelId),
    )
    .map(({ label }) => label)
    .join(', ');

  const pinnedTierLabels = currentWorkspace?.isAutoModelSelectionEnabled
    ? ''
    : Object.entries(currentWorkspace?.aiModelIdByTier ?? {})
        .filter(([, modelId]) => isModelExcluded(modelId as string))
        .map(([tier]) => getAiModelTierLabel(tier as AiModelTier))
        .join(', ');

  const warningIcon = (
    <IconAlertTriangle
      size={themeCssVariables.icon.size.md}
      aria-hidden="true"
    />
  );

  return (
    <>
      {isNonEmptyString(agentLabels) && (
        <StyledCalloutContainer>
          <Callout
            fullWidth
            status="warning"
            icon={warningIcon}
            title={t`Agents that will fail`}
            description={t`These agents use a model your settings exclude, so they fail when they run: ${agentLabels}`}
          />
        </StyledCalloutContainer>
      )}
      {isNonEmptyString(pinnedTierLabels) && (
        <StyledCalloutContainer>
          <Callout
            fullWidth
            status="warning"
            icon={warningIcon}
            title={t`Pinned models not in use`}
            description={t`These tiers fall back to an allowed model: ${pinnedTierLabels}`}
          />
        </StyledCalloutContainer>
      )}
    </>
  );
};
