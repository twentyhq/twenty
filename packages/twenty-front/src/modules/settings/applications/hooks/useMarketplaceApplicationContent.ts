import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useInstalledApplicationContent } from '@/settings/applications/hooks/useInstalledApplicationContent';
import { addInstalledIdsToApplicationContent } from '@/settings/applications/utils/addInstalledIdsToApplicationContent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindMarketplaceAppContentDocument } from '~/generated-metadata/graphql';

export const useMarketplaceApplicationContent = (
  universalIdentifier?: string,
) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data, loading, error } = useQuery(FindMarketplaceAppContentDocument, {
    variables: { universalIdentifier: universalIdentifier ?? '' },
    skip: !isNonEmptyString(universalIdentifier),
  });

  const isInstalled =
    currentWorkspace?.installedApplications.some(
      (installedApplication) =>
        installedApplication.universalIdentifier === universalIdentifier,
    ) ?? false;

  const installed = useInstalledApplicationContent({
    universalIdentifier,
    shouldSkip: !isInstalled,
  });

  const marketplaceApplication = data?.findMarketplaceAppDetail;
  const manifestContent = marketplaceApplication?.content;

  const content = isDefined(manifestContent)
    ? addInstalledIdsToApplicationContent({
        manifestContent,
        installedContent: installed.content,
      })
    : installed.content;

  return {
    name: marketplaceApplication?.name ?? installed.application?.name,
    logoUrl: marketplaceApplication?.logoUrl ?? installed.application?.logoUrl,
    installedApplicationId: installed.application?.id,
    content,
    isLoading: loading || installed.isLoading,
    error: error ?? installed.error,
  };
};
