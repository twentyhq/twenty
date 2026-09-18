import { getCommandMenuItemProgressLabel } from '@/command-menu-item/utils/getCommandMenuItemProgressLabel';
import { type Nullable } from 'twenty-shared/types';

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
    return getCommandMenuItemProgressLabel(progress);
  }

  if (shouldHideLabel) {
    return undefined;
  }

  return shortLabel ?? undefined;
};
