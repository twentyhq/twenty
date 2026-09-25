import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const RECORD_CREATION_COMMAND_LABEL_RENAMES = [
  {
    universalIdentifier:
      STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier,
    formerLabels: {
      label: 'Create new {objectLabelSingular}',
      shortLabel: 'New {objectLabelSingular}',
    },
    currentLabels: {
      label: 'Create {objectLabelSingular}',
      shortLabel: 'Create',
    },
  },
  {
    universalIdentifier:
      STANDARD_COMMAND_MENU_ITEMS.composeCampaignPinned.universalIdentifier,
    formerLabels: {
      label: 'Create new Campaign',
      shortLabel: 'New Campaign',
    },
    currentLabels: {
      label: 'Create Campaign',
      shortLabel: 'Create',
    },
  },
];

export const buildRecordCreationCommandLabelUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
}): FlatCommandMenuItem[] =>
  RECORD_CREATION_COMMAND_LABEL_RENAMES.flatMap(
    ({ universalIdentifier, formerLabels, currentLabels }) => {
      const existingCommandMenuItem =
        flatCommandMenuItemByUniversalIdentifier[universalIdentifier];

      if (!isDefined(existingCommandMenuItem)) {
        return [];
      }

      const shouldUpdateLabel =
        existingCommandMenuItem.label === formerLabels.label;
      const shouldUpdateShortLabel =
        existingCommandMenuItem.shortLabel === formerLabels.shortLabel;

      if (!shouldUpdateLabel && !shouldUpdateShortLabel) {
        return [];
      }

      return [
        {
          ...existingCommandMenuItem,
          label: shouldUpdateLabel
            ? currentLabels.label
            : existingCommandMenuItem.label,
          shortLabel: shouldUpdateShortLabel
            ? currentLabels.shortLabel
            : existingCommandMenuItem.shortLabel,
          updatedAt: now,
        },
      ];
    },
  );
