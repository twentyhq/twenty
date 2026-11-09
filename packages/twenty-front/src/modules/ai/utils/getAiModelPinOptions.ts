import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { type PinnableAiModel } from '@/ai/types/PinnableAiModel';
import { getDataResidencyDisplay } from '@/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/ai/utils/getModelIcon';

export const getAiModelPinOptions = ({
  aiModels,
  keepModelId,
}: {
  aiModels: PinnableAiModel[];
  keepModelId?: string;
}): SelectOption<string>[] => {
  const options = aiModels
    .filter(
      (model) =>
        !isDefined(model.effort) &&
        (!model.isDeprecated || model.modelId === keepModelId),
    )
    .map((model) => {
      const residencyFlag = model.dataResidency
        ? ` ${getDataResidencyDisplay(model.dataResidency)}`
        : '';
      const label = `${model.label}${residencyFlag}`;

      return {
        value: model.modelId,
        label: model.isDeprecated ? t`${label} (deprecated)` : label,
        contextualText: model.providerLabel ?? model.providerName ?? undefined,
        Icon: getModelIcon(model.modelFamily, model.providerName),
      };
    })
    .sort((first, second) => first.label.localeCompare(second.label));

  const isCurrentModelMissing =
    isNonEmptyString(keepModelId) &&
    !options.some((option) => option.value === keepModelId);

  if (!isCurrentModelMissing) {
    return options;
  }

  return [
    {
      value: keepModelId,
      label: t`${keepModelId} (unavailable)`,
      disabled: true,
    },
    ...options,
  ];
};
