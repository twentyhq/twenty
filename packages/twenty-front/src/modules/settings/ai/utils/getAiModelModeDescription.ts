import { t } from '@lingui/core/macro';
import { AI_MODEL_EFFORT_LABELS, isAiModelEffort } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getAiModelEffortLabel } from '@/ai/utils/getAiModelEffortLabel';

export const getAiModelModeDescription = (
  { model, isPinned }: Pick<ResolvedAiModelTier, 'model' | 'isPinned'>,
  { showAutomatic = true }: { showAutomatic?: boolean } = {},
) => {
  if (!isDefined(model)) {
    return t`No model available`;
  }

  const effort = model.effort;
  let label = model.label;

  if (isAiModelEffort(effort)) {
    const suffix = ` (${AI_MODEL_EFFORT_LABELS[effort]})`;
    const modelName = label.endsWith(suffix)
      ? label.slice(0, -suffix.length)
      : label;

    label = `${modelName} · ${getAiModelEffortLabel(effort)}`;
  }

  return isPinned || !showAutomatic ? label : t`${label} (Auto)`;
};
