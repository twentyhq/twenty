import { useMarketplaceApplicationContent } from '@/settings/applications/hooks/useMarketplaceApplicationContent';
import { type ApplicationContentLink } from '@/settings/applications/types/ApplicationContentLink';
import { getMarketplaceApplicationContentLink } from '@/settings/applications/utils/getMarketplaceApplicationContentLink';

export const useMarketplaceApplicationContentLink = (
  availableApplicationId?: string,
): ApplicationContentLink | undefined => {
  const { content } = useMarketplaceApplicationContent(availableApplicationId);

  return getMarketplaceApplicationContentLink({
    availableApplicationId,
    content,
  });
};
