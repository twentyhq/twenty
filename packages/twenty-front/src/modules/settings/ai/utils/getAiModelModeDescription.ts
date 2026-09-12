import { t } from '@lingui/core/macro';
import { AI_MODEL_EFFORT_LABELS, isAiModelEffort } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';
import { getAiModelEffortLabel } from '@/ai/utils/getAiModelEffortLabel';

export const getAiModelModeDescription = (
  { model, isPinned }: Pick<ResolvedAiModelTier, 'model' | 'isPinned'>,
  {
    showAutomatic = true,
    showEffort = true,
  }: { showAutomatic?: boolean; showEffort?: boolean } = {},
) => {
  if (!isDefined(model)) {
    return t`No model available`;
  }

  const effort = model.effort;
  const validEffort =
    isDefined(effort) && isAiModelEffort(effort) ? effort : undefined;
  const suffix = isDefined(validEffort)
    ? ` (${AI_MODEL_EFFORT_LABELS[validEffort]})`
    : '';
  const modelName =
    suffix && model.label.endsWith(suffix)
      ? model.label.slice(0, -suffix.length)
      : model.label;
  const label =
    showEffort && isDefined(validEffort)
      ? `${modelName} · ${getAiModelEffortLabel(validEffort)}`
      : modelName;

  return isPinned || !showAutomatic ? label : t`${label} (Auto)`;
};
