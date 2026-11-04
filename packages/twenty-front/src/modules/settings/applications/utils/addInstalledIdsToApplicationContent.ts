import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';

const addInstalledIds = ({
  manifestItems,
  installedItems,
}: {
  manifestItems: ApplicationContentItem[];
  installedItems: ApplicationContentItem[];
}): ApplicationContentItem[] => {
  const installedIdByUniversalIdentifier = new Map(
    installedItems.map((item) => [item.universalIdentifier, item.id]),
  );

  return manifestItems.map((item) => ({
    ...item,
    id:
      item.id ??
      installedIdByUniversalIdentifier.get(item.universalIdentifier) ??
      null,
  }));
};

export const addInstalledIdsToApplicationContent = ({
  manifestContent,
  installedContent,
}: {
  manifestContent: ApplicationContent;
  installedContent: ApplicationContent | null | undefined;
}): ApplicationContent => {
  if (!isDefined(installedContent)) {
    return manifestContent;
  }

  const withInstalledIds = (contentType: keyof ApplicationContent) =>
    addInstalledIds({
      manifestItems: manifestContent[contentType],
      installedItems: installedContent[contentType],
    });

  return {
    objects: withInstalledIds('objects'),
    fields: withInstalledIds('fields'),
    indexes: withInstalledIds('indexes'),
    views: withInstalledIds('views'),
    viewFields: withInstalledIds('viewFields'),
    pageLayouts: withInstalledIds('pageLayouts'),
    pageLayoutTabs: withInstalledIds('pageLayoutTabs'),
    navigationMenuItems: withInstalledIds('navigationMenuItems'),
    commandMenuItems: withInstalledIds('commandMenuItems'),
    frontComponents: withInstalledIds('frontComponents'),
    workflows: withInstalledIds('workflows'),
    logicFunctions: withInstalledIds('logicFunctions'),
    agents: withInstalledIds('agents'),
    skills: withInstalledIds('skills'),
    roles: withInstalledIds('roles'),
    permissionFlags: withInstalledIds('permissionFlags'),
    connectionProviders: withInstalledIds('connectionProviders'),
    publicAssets: withInstalledIds('publicAssets'),
    translations: withInstalledIds('translations'),
  };
};
