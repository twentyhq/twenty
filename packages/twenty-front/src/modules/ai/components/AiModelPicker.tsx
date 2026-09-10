import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  AUTO_SELECT_MODEL_ID_BY_TIER,
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  getAiModelTierFromModelId,
  type AiModelTier,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiModelTierSlider } from '@/ai/components/AiModelTierSlider';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { getNearestAiModelTier } from '@/ai/utils/getNearestAiModelTier';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const NO_PINNED_MODEL = '';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSliderCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  corner-shape: round;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiModelPickerProps = {
  modelId: string;
  onModelIdChange: (modelId: string) => void;
  disabled?: boolean;
};

// Agents follow the workspace tier by default, can name a tier of their own,
// and, for whoever needs it, can pin one exact model behind the advanced link.
export const AiModelPicker = ({
  modelId,
  onModelIdChange,
  disabled = false,
}: AiModelPickerProps) => {
  const { t } = useLingui();
  const tiers = useAiModelTiers();
  const aiModels = useAtomStateValue(aiModelsState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isWorkspaceDefault = modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID;
  const explicitTier = getAiModelTierFromModelId(modelId);
  const pinnedModel =
    isWorkspaceDefault || isDefined(explicitTier)
      ? undefined
      : aiModels.find((model) => model.modelId === modelId);
  const hasPinnedModel = !isWorkspaceDefault && !isDefined(explicitTier);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasPinnedModel);

  const selectedTier: AiModelTier = isWorkspaceDefault
    ? (currentWorkspace?.aiAgentModelTier ?? 'fast')
    : (explicitTier ?? getNearestAiModelTier(pinnedModel, tiers));

  const pinnedModelOptions = aiModels
    .filter((model) => !model.isDeprecated || model.modelId === modelId)
    .map((model) => ({
      value: model.modelId,
      label: model.isDeprecated ? t`${model.label} (deprecated)` : model.label,
      contextualText: model.providerLabel ?? model.providerName ?? undefined,
      Icon: getModelIcon(model.modelFamily, model.providerName),
    }))
    .sort((first, second) => first.label.localeCompare(second.label));

  const handlePinnedModelChange = (value: string) => {
    onModelIdChange(
      value === NO_PINNED_MODEL
        ? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID
        : value,
    );
  };

  return (
    <StyledContainer>
      <StyledSliderCard>
        <AiModelTierSlider
          selectedTier={selectedTier}
          onTierChange={(tier) =>
            onModelIdChange(AUTO_SELECT_MODEL_ID_BY_TIER[tier])
          }
          title={hasPinnedModel ? (pinnedModel?.label ?? modelId) : undefined}
          disabled={disabled}
        />
      </StyledSliderCard>
      <StyledFooter>
        <StyledHint>
          {isWorkspaceDefault
            ? t`Follows the workspace default for agents`
            : hasPinnedModel
              ? t`Pinned to a specific model`
              : t`Set for this agent only`}
        </StyledHint>
        {!isAdvancedOpen && !disabled && (
          <LightButton
            title={t`Advanced`}
            accent="tertiary"
            onClick={() => setIsAdvancedOpen(true)}
          />
        )}
      </StyledFooter>
      {isAdvancedOpen && (
        <Select
          dropdownId="ai-model-picker-pinned-model"
          label={t`Pin a specific model`}
          description={t`Overrides the tier above until you switch back to automatic`}
          value={hasPinnedModel ? modelId : NO_PINNED_MODEL}
          onChange={handlePinnedModelChange}
          emptyOption={{ value: NO_PINNED_MODEL, label: t`Automatic` }}
          options={pinnedModelOptions}
          withSearchInput
          disabled={disabled}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
      )}
    </StyledContainer>
  );
};
