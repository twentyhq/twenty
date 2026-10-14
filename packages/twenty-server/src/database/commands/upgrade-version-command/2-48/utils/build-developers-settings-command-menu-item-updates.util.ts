import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

type DevelopersSettingsCommandMenuItemValues = {
  label: string;
  shortLabel: string;
  icon: string;
  path: string;
};

const MCP_AND_APIS_SETTINGS_VALUES: DevelopersSettingsCommandMenuItemValues = {
  label: 'Go to MCP & APIs Settings',
  shortLabel: 'MCP & APIs',
  icon: 'IconPlug',
  path: '/settings/api-webhooks',
};

const DEVELOPERS_SETTINGS_VALUES: DevelopersSettingsCommandMenuItemValues = {
  label: 'Go to Developers Settings',
  shortLabel: 'Developers',
  icon: 'IconCode',
  path: '/settings/developers',
};

// Values a workspace customized are kept
export const buildDevelopersSettingsCommandMenuItemUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  now,
  direction,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatCommandMenuItem[] => {
  const existingCommandMenuItem =
    flatCommandMenuItemByUniversalIdentifier[
      STANDARD_COMMAND_MENU_ITEMS.goToSettingsApiWebhooks.universalIdentifier
    ];

  if (!isDefined(existingCommandMenuItem)) {
    return [];
  }

  const [formerValues, currentValues] =
    direction === 'up'
      ? [MCP_AND_APIS_SETTINGS_VALUES, DEVELOPERS_SETTINGS_VALUES]
      : [DEVELOPERS_SETTINGS_VALUES, MCP_AND_APIS_SETTINGS_VALUES];

  const shouldUpdateLabel =
    existingCommandMenuItem.label === formerValues.label;
  const shouldUpdateShortLabel =
    existingCommandMenuItem.shortLabel === formerValues.shortLabel;
  const shouldUpdateIcon = existingCommandMenuItem.icon === formerValues.icon;
  const shouldUpdatePath =
    existingCommandMenuItem.payload?.path === formerValues.path;

  if (
    !shouldUpdateLabel &&
    !shouldUpdateShortLabel &&
    !shouldUpdateIcon &&
    !shouldUpdatePath
  ) {
    return [];
  }

  return [
    {
      ...existingCommandMenuItem,
      label: shouldUpdateLabel
        ? currentValues.label
        : existingCommandMenuItem.label,
      shortLabel: shouldUpdateShortLabel
        ? currentValues.shortLabel
        : existingCommandMenuItem.shortLabel,
      icon: shouldUpdateIcon ? currentValues.icon : existingCommandMenuItem.icon,
      payload: shouldUpdatePath
        ? { path: currentValues.path }
        : existingCommandMenuItem.payload,
      updatedAt: now,
    },
  ];
};
