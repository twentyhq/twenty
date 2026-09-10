import { t } from '@lingui/core/macro';

import { getDataResidencyDisplay } from '@/settings/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

// Deprecated models are hidden unless one is the current pin, so an existing
// choice stays visible until it is changed.
export const getAiModelPinOptions = ({
  aiModels,
  keepModelId,
}: {
  aiModels: ClientAiModelConfig[];
  keepModelId?: string;
}) =>
  aiModels
    .filter((model) => !model.isDeprecated || model.modelId === keepModelId)
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
