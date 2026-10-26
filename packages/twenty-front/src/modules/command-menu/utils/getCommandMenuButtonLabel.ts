import { getCommandMenuItemProgressLabel } from '@/command-menu-item/utils/getCommandMenuItemProgressLabel';
import { isNonEmptyString } from '@sniptt/guards';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getCommandMenuButtonLabel = ({
  shortLabel,
  isLoading,
  keepLabelWhileLoading = false,
  progress,
  shouldHideLabel,
}: {
  shortLabel?: Nullable<string>;
  isLoading: boolean;
  keepLabelWhileLoading?: boolean;
  progress?: number;
  shouldHideLabel: boolean;
}): string | undefined => {
  if (isLoading) {
    if (
      keepLabelWhileLoading &&
      !isDefined(progress) &&
      isNonEmptyString(shortLabel)
    ) {
      return shortLabel;
    }

    return getCommandMenuItemProgressLabel(progress);
  }

  if (shouldHideLabel) {
    return undefined;
  }

  return shortLabel ?? undefined;
};
