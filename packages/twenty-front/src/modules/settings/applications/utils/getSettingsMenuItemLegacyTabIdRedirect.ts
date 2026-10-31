import { getSettingsMenuItemTabId } from '@/settings/applications/utils/getSettingsMenuItemTabId';
import { type SettingsMenuItem } from '~/generated-metadata/graphql';

// Links shared before slugs existed point at the universalIdentifier, which stays
// a valid alias of the tab.
export const getSettingsMenuItemLegacyTabIdRedirect = ({
  settingsMenuItems,
  hashTabId,
}: {
  settingsMenuItems: Pick<SettingsMenuItem, 'universalIdentifier' | 'slug'>[];
  hashTabId: string;
}): string | undefined => {
  if (
    settingsMenuItems.some(
      (settingsMenuItem) =>
        getSettingsMenuItemTabId(settingsMenuItem) === hashTabId,
    )
  ) {
    return undefined;
  }

  const legacySettingsMenuItem = settingsMenuItems.find(
    (settingsMenuItem) => settingsMenuItem.universalIdentifier === hashTabId,
  );

  return legacySettingsMenuItem
    ? getSettingsMenuItemTabId(legacySettingsMenuItem)
    : undefined;
};
