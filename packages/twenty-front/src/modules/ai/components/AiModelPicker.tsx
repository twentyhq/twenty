import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import {
  AUTO_SELECT_MODEL_ID_BY_TIER,
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
} from 'twenty-shared/ai';
import { IconWand } from 'twenty-ui/icon';

import { AiModelPinSelect } from '@/ai/components/AiModelPinSelect';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { getAiModelTierLabel } from '@/ai/utils/getAiModelTierLabel';
import { getAiModelModeDescription } from '@/ai/utils/getAiModelModeDescription';
import { getModelIcon } from '@/ai/utils/getModelIcon';
import { workspaceAiModelsSelector } from '@/ai/states/workspaceAiModelsSelector';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiModelPickerProps = {
  modelId: string;
  onModelIdChange: (modelId: string) => void;
  disabled?: boolean;
};

export const AiModelPicker = ({
  modelId,
  onModelIdChange,
  disabled = false,
}: AiModelPickerProps) => {
  const { t } = useLingui();
  const dropdownId = useId();
  const tiers = useAiModelTiers();
  const { agentTier } = useWorkspaceAiModelTiers();
  const workspaceAiModels = useAtomStateValue(workspaceAiModelsSelector);
  const workspaceTierLabel = getAiModelTierLabel(agentTier);

  return (
    <AiModelPinSelect
      dropdownId={dropdownId}
      label={t`Model`}
      modelId={modelId}
      onChange={(selectedModelId) =>
        onModelIdChange(
          selectedModelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
        )
      }
      aiModels={workspaceAiModels}
      automaticOptions={[
        {
          value: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
          label: t`Workspace default · ${workspaceTierLabel}`,
          Icon: IconWand,
        },
        ...tiers.map((tier) => ({
          value: AUTO_SELECT_MODEL_ID_BY_TIER[tier.tier],
          label: tier.label,
          contextualText: getAiModelModeDescription(tier),
          Icon: getModelIcon(tier.model?.modelFamily, tier.model?.providerName),
        })),
      ]}
      disabled={disabled}
      dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
    />
  );
};
