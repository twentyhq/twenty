import { type SettingsMenuItem } from '~/generated-metadata/graphql';

// Links shared before slugs existed still point at the universalIdentifier.
export const getSettingsMenuItemLegacyTabIdRedirect = ({
  settingsMenuItems,
  hashTabId,
}: {
  settingsMenuItems: Pick<SettingsMenuItem, 'universalIdentifier' | 'slug'>[];
  hashTabId: string;
}): string | undefined =>
  settingsMenuItems.find(
    (settingsMenuItem) => settingsMenuItem.universalIdentifier === hashTabId,
  )?.slug ?? undefined;
