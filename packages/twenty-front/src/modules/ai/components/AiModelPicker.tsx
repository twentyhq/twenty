import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import {
  AUTO_SELECT_MODEL_ID_BY_TIER,
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiModelTierSlider } from '@/ai/components/AiModelTierSlider';
import { useAiModelTiers } from '@/ai/hooks/useAiModelTiers';
import { useWorkspaceAiModelTiers } from '@/ai/hooks/useWorkspaceAiModelTiers';
import { getAiModelTierForAgentModelId } from '@/ai/utils/getAiModelTierForAgentModelId';
import { getNearestAiModelTier } from '@/ai/utils/getNearestAiModelTier';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { AUTOMATIC_MODEL_PIN } from '@/settings/ai/constants/AutomaticModelPin';
import { getAiModelPinOptions } from '@/settings/ai/utils/getAiModelPinOptions';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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

export const AiModelPicker = ({
  modelId,
  onModelIdChange,
  disabled = false,
}: AiModelPickerProps) => {
  const { t } = useLingui();
  const tiers = useAiModelTiers();
  const aiModels = useAtomStateValue(aiModelsState);
  const { agentTier } = useWorkspaceAiModelTiers();

  const isWorkspaceDefault = modelId === AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID;
  const tierFromModelId = getAiModelTierForAgentModelId(modelId, agentTier);
  const hasPinnedModel = !isDefined(tierFromModelId);
  const pinnedModel = hasPinnedModel
    ? aiModels.find((model) => model.modelId === modelId)
    : undefined;

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasPinnedModel);

  const selectedTier =
    tierFromModelId ?? getNearestAiModelTier(pinnedModel, tiers);

  const pinnedModelOptions = useMemo(
    () =>
      isAdvancedOpen
        ? getAiModelPinOptions({ aiModels, keepModelId: modelId })
        : [],
    [aiModels, isAdvancedOpen, modelId],
  );

  const handlePinnedModelChange = (value: string) => {
    onModelIdChange(
      value === AUTOMATIC_MODEL_PIN
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
          value={hasPinnedModel ? modelId : AUTOMATIC_MODEL_PIN}
          onChange={handlePinnedModelChange}
          emptyOption={{ value: AUTOMATIC_MODEL_PIN, label: t`Automatic` }}
          options={pinnedModelOptions}
          withSearchInput
          disabled={disabled}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
      )}
    </StyledContainer>
  );
};
