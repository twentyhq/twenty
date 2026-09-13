import { t } from '@lingui/core/macro';
import { type AiModelEffort } from 'twenty-shared/ai';

export const getAiModelEffortLabel = (effort: AiModelEffort): string => {
  const labels: Record<AiModelEffort, string> = {
    none: t`None`,
    minimal: t`Minimal`,
    low: t`Low`,
    medium: t`Medium`,
    high: t`High`,
    xhigh: t`Very High`,
    max: t`Max`,
  };

  return labels[effort];
};
