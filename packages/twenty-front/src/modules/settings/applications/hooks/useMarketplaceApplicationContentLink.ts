import { isDefined } from 'twenty-shared/utils';

import { useMarketplaceApplicationContent } from '@/settings/applications/hooks/useMarketplaceApplicationContent';
import { type ApplicationContentLink } from '@/settings/applications/types/ApplicationContentLink';
import { getApplicationContentItemCount } from '@/settings/applications/utils/getApplicationContentItemCount';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';

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
    path: getApplicationContentPath({
      location: { kind: 'marketplace', availableApplicationId },
    }),
    itemCount,
  };
};
