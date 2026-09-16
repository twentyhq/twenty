import { t } from '@lingui/core/macro';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getCommandMenuButtonLabel = ({
  shortLabel,
  isLoading,
  progress,
  shouldHideLabel,
}: {
  shortLabel?: Nullable<string>;
  isLoading: boolean;
  progress?: number;
  shouldHideLabel: boolean;
}): string | undefined => {
  if (isLoading) {
    return isDefined(progress) && progress > 0
      ? `${Math.round(progress)}%`
      : t`Preparing…`;
  }

  if (shouldHideLabel) {
    return undefined;
  }

  return shortLabel ?? undefined;
};
