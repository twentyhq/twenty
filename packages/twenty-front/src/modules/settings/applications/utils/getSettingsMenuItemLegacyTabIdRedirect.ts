import { getSettingsMenuItemTabId } from '@/settings/applications/utils/getSettingsMenuItemTabId';
import { isDefined } from 'twenty-shared/utils';
import { type SettingsMenuItem } from '~/generated-metadata/graphql';

// Links shared before slugs existed still point at the universalIdentifier.
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

  return isDefined(legacySettingsMenuItem)
    ? getSettingsMenuItemTabId(legacySettingsMenuItem)
    : undefined;
};
