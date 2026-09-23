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
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] => {
  const existingCommandMenuItem =
    flatCommandMenuItemByUniversalIdentifier[
      STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier
    ];

  if (!isDefined(existingCommandMenuItem)) {
    return [];
  }

  const shouldUpdateLabel =
    existingCommandMenuItem.label === FORMER_LABELS.label;
  const shouldUpdateShortLabel =
    existingCommandMenuItem.shortLabel === FORMER_LABELS.shortLabel;

  if (!shouldUpdateLabel && !shouldUpdateShortLabel) {
    return [];
  }

  return [
    {
      ...existingCommandMenuItem,
      label: shouldUpdateLabel
        ? CURRENT_LABELS.label
        : existingCommandMenuItem.label,
      shortLabel: shouldUpdateShortLabel
        ? CURRENT_LABELS.shortLabel
        : existingCommandMenuItem.shortLabel,
      updatedAt: now,
    },
  ];
};
