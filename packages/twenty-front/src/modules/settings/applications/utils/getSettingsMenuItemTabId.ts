import { type SettingsMenuItem } from '~/generated-metadata/graphql';

export const getSettingsMenuItemTabId = (
  settingsMenuItem: Pick<SettingsMenuItem, 'universalIdentifier' | 'slug'>,
): string => settingsMenuItem.slug ?? settingsMenuItem.universalIdentifier;
