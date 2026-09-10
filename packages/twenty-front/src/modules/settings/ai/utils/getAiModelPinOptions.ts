import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type PinnableAiModel } from '@/settings/ai/types/PinnableAiModel';
import { getDataResidencyDisplay } from '@/settings/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';

// Effort variants are picked through their base model and a separate effort
// select, so only base models are listed. A deprecated model stays listed
// while it is the current pin, so an existing choice is visible until changed.
export const getAiModelPinOptions = ({
  aiModels,
  keepModelId,
}: {
  aiModels: PinnableAiModel[];
  keepModelId?: string;
}) =>
  aiModels
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
