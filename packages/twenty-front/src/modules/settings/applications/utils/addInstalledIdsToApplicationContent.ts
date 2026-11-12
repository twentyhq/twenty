import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_CONTENT_TYPES } from '@/settings/applications/constants/ApplicationContentTypes';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';

const addInstalledIds = ({
  manifestItems,
  installedItems,
}: {
  manifestItems: ApplicationContentItem[];
  installedItems: Pick<ApplicationContentItem, 'id' | 'universalIdentifier'>[];
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

  const content = { ...manifestContent };

  for (const contentType of APPLICATION_CONTENT_TYPES) {
    content[contentType] = addInstalledIds({
      manifestItems: manifestContent[contentType],
      installedItems: installedContent[contentType],
    });
  }

  return content;
};
