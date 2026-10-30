import { useLingui } from '@lingui/react/macro';
import {
  AUTO_SELECT_MODEL_ID_BY_TIER,
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
} from 'twenty-shared/ai';

import { AiModelPinSelect } from '@/ai/components/AiModelPinSelect';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { getAiModelModeDescription } from '@/ai/utils/getAiModelModeDescription';
import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { getModelIcon } from '@/ai/utils/getModelIcon';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiModelPickerProps = {
  modelId: string;
  onModelIdChange: (modelId: string) => void;
  label?: string;
  disabled?: boolean;
};

export const AiModelPicker = ({
  modelId,
  onModelIdChange,
  label,
  disabled = false,
}: AiModelPickerProps) => {
  const { t } = useLingui();
  const tiers = useAiModelTiers();
  const aiModels = useAtomStateValue(aiModelsState);
  const { agentTier } = useWorkspaceAiModelTiers();

  const workspaceDefaultModel = tiers.find(
    (tier) => tier.tier === agentTier,
  )?.model;

  const automaticOptions = [
    {
      value: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
      label: t`Workspace default`,
      contextualText: getAiModelTierLabel(agentTier),
      Icon: getModelIcon(
        workspaceDefaultModel?.modelFamily,
        workspaceDefaultModel?.providerName,
      ),
    },
    ...tiers.map((tier) => ({
      value: AUTO_SELECT_MODEL_ID_BY_TIER[tier.tier],
      label: tier.label,
      contextualText: getAiModelModeDescription(tier, {
        showAutomatic: false,
      }),
      Icon: getModelIcon(tier.model?.modelFamily, tier.model?.providerName),
    })),
  ];

  return (
    <AiModelPinSelect
      dropdownId="ai-model-picker"
      label={label}
      modelId={modelId}
      onChange={(nextModelId) =>
        onModelIdChange(nextModelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID)
      }
      aiModels={aiModels}
      automaticOptions={automaticOptions}
      disabled={disabled}
      dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
    />
  );
};
