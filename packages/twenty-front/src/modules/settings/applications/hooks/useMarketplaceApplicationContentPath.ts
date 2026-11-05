import { isDefined } from 'twenty-shared/utils';

import { useMarketplaceApplicationContent } from '@/settings/applications/hooks/useMarketplaceApplicationContent';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';
import { getNonEmptyApplicationContentTypes } from '@/settings/applications/utils/getNonEmptyApplicationContentTypes';

export const useMarketplaceApplicationContentPath = (
  availableApplicationId?: string,
) => {
  const { content } = useMarketplaceApplicationContent(availableApplicationId);

  if (
    !isDefined(availableApplicationId) ||
    !isDefined(content) ||
    getNonEmptyApplicationContentTypes(content).length === 0
  ) {
    return undefined;
  }

  return getApplicationContentPath({
    location: { kind: 'marketplace', availableApplicationId },
  });
};
