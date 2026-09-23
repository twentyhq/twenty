import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const FORMER_LABELS = {
  label: 'Create new {objectLabelSingular}',
  shortLabel: 'New {objectLabelSingular}',
};

const CURRENT_LABELS = {
  label: 'Create {objectLabelSingular}',
  shortLabel: 'Create',
};

export const buildRecordCreationCommandLabelUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  direction,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem[] => {
  const existingCommandMenuItem =
    flatCommandMenuItemByUniversalIdentifier[
      STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier
    ];

  if (!isDefined(existingCommandMenuItem)) {
    return [];
  }

  const sourceLabels = direction === 'up' ? FORMER_LABELS : CURRENT_LABELS;
  const targetLabels = direction === 'up' ? CURRENT_LABELS : FORMER_LABELS;

  const shouldUpdateLabel =
    existingCommandMenuItem.label === sourceLabels.label;
  const shouldUpdateShortLabel =
    existingCommandMenuItem.shortLabel === sourceLabels.shortLabel;

  if (!shouldUpdateLabel && !shouldUpdateShortLabel) {
    return [];
  }

  return [
    {
      ...existingCommandMenuItem,
      label: shouldUpdateLabel
        ? targetLabels.label
        : existingCommandMenuItem.label,
      shortLabel: shouldUpdateShortLabel
        ? targetLabels.shortLabel
        : existingCommandMenuItem.shortLabel,
      updatedAt: now,
    },
  ];
};
