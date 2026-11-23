import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentLink } from '@/settings/applications/types/ApplicationContentLink';
import { getApplicationContentItemCount } from '@/settings/applications/utils/getApplicationContentItemCount';

export const getMarketplaceApplicationContentLink = ({
  availableApplicationId,
  content,
}: {
  availableApplicationId?: string;
  content?: ApplicationContent | null;
}): ApplicationContentLink | undefined => {
  if (!isDefined(availableApplicationId) || !isDefined(content)) {
    return undefined;
  }

  const itemCount = getApplicationContentItemCount(content);

  if (itemCount === 0) {
    return undefined;
  }

  return {
    path: getSettingsPath(SettingsPath.AvailableApplicationResources, {
      availableApplicationId,
    }),
    itemCount,
  };
};
