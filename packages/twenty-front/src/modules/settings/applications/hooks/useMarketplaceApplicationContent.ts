import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { useInstalledApplicationContent } from '@/settings/applications/hooks/useInstalledApplicationContent';
import { FindMarketplaceAppContentDocument } from '~/generated-metadata/graphql';

export const useMarketplaceApplicationContent = (
  universalIdentifier?: string,
) => {
  const { data, loading } = useQuery(FindMarketplaceAppContentDocument, {
    variables: { universalIdentifier: universalIdentifier ?? '' },
    skip: !isNonEmptyString(universalIdentifier),
  });

  const marketplaceApplication = data?.findMarketplaceAppDetail;

  // Built-in apps have no manifest, so their installed content stands in
  const shouldUseInstalledContent =
    !loading && !isDefined(marketplaceApplication?.content);

  const installed = useInstalledApplicationContent({
    universalIdentifier,
    skip: !shouldUseInstalledContent,
  });

  return {
    name: marketplaceApplication?.name ?? installed.application?.name,
    logoUrl: marketplaceApplication?.logoUrl ?? installed.application?.logoUrl,
    installedApplicationId: installed.application?.id,
    content: marketplaceApplication?.content ?? installed.content,
    isLoading: loading || installed.isLoading,
  };
};
