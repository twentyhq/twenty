import { t } from '@lingui/core/macro';

import { pickStatusLabel } from '@/ai/utils/tool-display/pickStatusLabel';

export const buildGenericToolStatusMessage = ({
  label,
  isFinished,
}: {
  label: string;
  isFinished: boolean;
}): string =>
  pickStatusLabel({
    isFinished,
    loadingLabel: t`Running ${label}`,
    completedLabel: t`Ran ${label}`,
  });
