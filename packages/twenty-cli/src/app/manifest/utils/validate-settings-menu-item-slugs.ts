import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getDuplicateValues } from '@/app/manifest/utils/manifest-validation-helpers';

export const validateSettingsMenuItemSlugs = (
  manifest: Pick<Manifest, 'settingsMenuItems'>,
): string[] =>
  getDuplicateValues(
    manifest.settingsMenuItems
      .map((settingsMenuItem) => settingsMenuItem.slug)
      .filter(isDefined),
  ).map(
    (duplicateSlug) =>
      `Settings menu item slug "${duplicateSlug}" is used more than once. Slugs must be unique within an application.`,
  );
