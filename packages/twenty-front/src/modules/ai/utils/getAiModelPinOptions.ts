import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type PinnableAiModel } from '@/ai/types/PinnableAiModel';
import { getDataResidencyDisplay } from '@/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/ai/utils/getModelIcon';

// Effort variants are picked via their base model; a deprecated current pin stays listed.
export const getAiModelPinOptions = ({
  aiModels,
  keepModelId,
}: {
  aiModels: PinnableAiModel[];
  keepModelId?: string;
}) => {
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
    });

  const isKeptModelUnavailable =
    isNonEmptyString(keepModelId) &&
    !aiModels.some((model) => model.modelId === keepModelId);

  return [
    ...options,
    ...(isKeptModelUnavailable
      ? [{ value: keepModelId, label: t`${keepModelId} (unavailable)` }]
      : []),
  ].sort((first, second) => first.label.localeCompare(second.label));
};
