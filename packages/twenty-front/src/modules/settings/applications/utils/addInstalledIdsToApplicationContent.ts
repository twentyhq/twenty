import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

export const addInstalledIdsToApplicationContent = (
  manifestContent: ApplicationContent,
  installedContent: ApplicationContent | null | undefined,
): ApplicationContent => {
  if (!isDefined(installedContent)) {
    return manifestContent;
  }

  const contentTypes = Object.keys(manifestContent).filter(
    (key): key is ApplicationContentType => key !== '__typename',
  );

  return Object.fromEntries(
    contentTypes.map((contentType) => {
      const installedIdByUniversalIdentifier = new Map(
        installedContent[contentType].map((item) => [
          item.universalIdentifier,
          item.id,
        ]),
      );

      return [
        contentType,
        manifestContent[contentType].map((item) => ({
          ...item,
          id:
            item.id ??
            installedIdByUniversalIdentifier.get(item.universalIdentifier) ??
            null,
        })),
      ];
    }),
  ) as ApplicationContent;
};
