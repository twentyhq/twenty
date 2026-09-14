import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ComponentProps } from 'react';
import { isAiModelEffort, parseAiModelVariantId } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconWand } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AUTOMATIC_MODEL_PIN } from '@/settings/ai/constants/AutomaticModelPin';
import { getAiModelEffortLabel } from '@/ai/utils/getAiModelEffortLabel';
import { type PinnableAiModel } from '@/settings/ai/types/PinnableAiModel';
import { getAiModelPinOptions } from '@/settings/ai/utils/getAiModelPinOptions';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

const DEFAULT_EFFORT = '';

const StyledRow = styled.div<{ hasEffortSelect: boolean }>`
  align-items: flex-end;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: ${({ hasEffortSelect }) =>
    hasEffortSelect ? 'minmax(0, 1fr) 96px' : 'minmax(0, 1fr)'};
`;

type AiModelPinSelectProps = {
  dropdownId: string;
  // null follows the tier automatically; a variant id names its effort.
  modelId: string | null;
  onChange: (modelId: string | null) => void;
  aiModels: PinnableAiModel[];
  emptyOptionLabel?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  selectSizeVariant?: ComponentProps<typeof Select>['selectSizeVariant'];
  dropdownWidth?: ComponentProps<typeof Select>['dropdownWidth'];
};

export const AiModelPinSelect = ({
  dropdownId,
  modelId,
  onChange,
  aiModels,
  emptyOptionLabel,
  label,
  description,
  disabled = false,
  selectSizeVariant,
  dropdownWidth,
}: AiModelPinSelectProps) => {
  const { t } = useLingui();

  const { modelId: baseModelId, effort } = parseAiModelVariantId(modelId ?? '');
  const baseModel = aiModels.find((model) => model.modelId === baseModelId);
  const efforts = (baseModel?.efforts ?? []).filter(isAiModelEffort);

  const handleModelChange = (value: string) => {
    if (value === AUTOMATIC_MODEL_PIN) {
      onChange(null);

      return;
    }

    const nextModel = aiModels.find((model) => model.modelId === value);
    const keepsEffort =
      isDefined(effort) && (nextModel?.efforts ?? []).includes(effort);

    onChange(keepsEffort ? `${value}@${effort}` : value);
  };

  const handleEffortChange = (value: string) => {
    onChange(
      value === DEFAULT_EFFORT ? baseModelId : `${baseModelId}@${value}`,
    );
  };

  return (
    <StyledRow hasEffortSelect={efforts.length > 0}>
      <Select
        dropdownId={dropdownId}
        label={label}
        description={description}
        value={isDefined(modelId) ? baseModelId : AUTOMATIC_MODEL_PIN}
        onChange={handleModelChange}
        showIconInControl={isDefined(modelId)}
        options={[
          ...(isDefined(emptyOptionLabel)
            ? [
                {
                  value: AUTOMATIC_MODEL_PIN,
                  label: emptyOptionLabel,
                  Icon: IconWand,
                },
              ]
            : []),
          ...getAiModelPinOptions({ aiModels, keepModelId: baseModelId }),
        ]}
        withSearchInput
        disabled={disabled}
        selectSizeVariant={selectSizeVariant}
        dropdownWidth={dropdownWidth}
      />
      {efforts.length > 0 && (
        <Select
          dropdownId={`${dropdownId}-effort`}
          value={effort ?? DEFAULT_EFFORT}
          onChange={handleEffortChange}
          options={[
            {
              value: DEFAULT_EFFORT,
              label: t`Default`,
              fullLabel: t`Reasoning: Default`,
            },
            ...efforts.map((availableEffort) => ({
              value: availableEffort,
              label: getAiModelEffortLabel(availableEffort),
              fullLabel: t`Reasoning: ${getAiModelEffortLabel(availableEffort)}`,
            })),
          ]}
          disabled={disabled}
          selectSizeVariant={selectSizeVariant}
          dropdownWidth={GenericDropdownContentWidth.Medium}
        />
      )}
    </StyledRow>
  );
};
