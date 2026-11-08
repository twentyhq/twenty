import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import {
  AI_MODEL_TIERS,
  isAiDataPolicyActive,
  isAiModelCompliantWithDataPolicy,
  parseAiModelVariantId,
} from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isAutoSelectModelId,
  isDefined,
  isNonEmptyString,
} from 'twenty-shared/utils';
import { IconCpu, IconLego } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';

import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

type AiDataPolicyAffectedEntry = {
  id: string;
  kind: 'agent' | 'modelTier';
  label: string;
};

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

  const affectedAgents: AiDataPolicyAffectedEntry[] = (
    data?.findManyAgents ?? []
  )
    .filter(
      ({ modelId }) =>
        isDefined(modelId) &&
        !isAutoSelectModelId(modelId) &&
        isModelExcluded(modelId),
    )
    .map(({ id, label }) => ({ id, kind: 'agent', label }));

  const pinnedModelTiers = currentWorkspace?.isAutoModelSelectionEnabled
    ? []
    : AI_MODEL_TIERS;

  const affectedModelTiers: AiDataPolicyAffectedEntry[] = pinnedModelTiers
    .filter((tier) => {
      const pinnedModelId = currentWorkspace?.aiModelIdByTier?.[tier];

      return isNonEmptyString(pinnedModelId) && isModelExcluded(pinnedModelId);
    })
    .map((tier) => ({
      id: tier,
      kind: 'modelTier',
      label: getAiModelTierLabel(tier),
    }));

  const affectedEntries = [...affectedAgents, ...affectedModelTiers];

  if (affectedEntries.length === 0) {
    return null;
  }

  return (
    <SettingsListCard
      items={affectedEntries}
      getItemLabel={({ label }) => label}
      getItemDescription={({ kind }) =>
        kind === 'agent'
          ? t`Agent · its model isn't allowed by these settings`
          : t`Model tier · switches to an allowed model`
      }
      RowIconFn={({ kind }) => (kind === 'agent' ? IconLego : IconCpu)}
      RowRightComponent={({ item }) =>
        item.kind === 'agent' ? (
          <Status color="orange">{t`Will fail`}</Status>
        ) : (
          <Status color="gray">{t`Falls back`}</Status>
        )
      }
      to={({ id, kind }) =>
        kind === 'agent'
          ? getCoreAgentLink(id)
          : `${getSettingsPath(SettingsPath.AI)}#${SETTINGS_AI_TABS.TABS_IDS.MODELS}`
      }
    />
  );
};
