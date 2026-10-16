import { t } from '@lingui/core/macro';
import { getLegacySettingsMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import {
  type FrontComponent,
  type SettingsMenuItem,
} from '~/generated-metadata/graphql';

// This string identifies persisted menu items created before custom titles were supported.
// oxlint-disable-next-line lingui/no-unlocalized-strings
const LEGACY_SETTINGS_MENU_ITEM_TITLE = 'Settings';

export const getSettingsMenuItemDisplayTitle = ({
  applicationUniversalIdentifier,
  frontComponents,
  settingsMenuItem,
}: {
  applicationUniversalIdentifier: string;
  frontComponents: Pick<FrontComponent, 'id' | 'universalIdentifier'>[];
  settingsMenuItem: Pick<
    SettingsMenuItem,
    'universalIdentifier' | 'frontComponentId' | 'title'
  >;
}): string => {
  if (settingsMenuItem.title !== LEGACY_SETTINGS_MENU_ITEM_TITLE) {
    return settingsMenuItem.title;
  }

  const frontComponentUniversalIdentifier = frontComponents.find(
    (frontComponent) => frontComponent.id === settingsMenuItem.frontComponentId,
  )?.universalIdentifier;

  if (!isDefined(frontComponentUniversalIdentifier)) {
    return settingsMenuItem.title;
  }

  const legacySettingsMenuItemUniversalIdentifier =
    getLegacySettingsMenuItemUniversalIdentifier({
      applicationUniversalIdentifier,
      frontComponentUniversalIdentifier,
    });

  return settingsMenuItem.universalIdentifier ===
    legacySettingsMenuItemUniversalIdentifier
    ? t`Settings`
    : settingsMenuItem.title;
};
