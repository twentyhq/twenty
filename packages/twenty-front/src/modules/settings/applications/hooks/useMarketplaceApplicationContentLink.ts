import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { useMarketplaceApplicationContent } from '@/settings/applications/hooks/useMarketplaceApplicationContent';
import { type ApplicationContentLink } from '@/settings/applications/types/ApplicationContentLink';
import { getApplicationContentItemCount } from '@/settings/applications/utils/getApplicationContentItemCount';

export const useMarketplaceApplicationContentLink = (
  availableApplicationId?: string,
): ApplicationContentLink | undefined => {
  const { content } = useMarketplaceApplicationContent(availableApplicationId);

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
