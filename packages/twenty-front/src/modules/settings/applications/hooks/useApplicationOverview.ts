import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type Application,
  FindMarketplaceAppDetailDocument,
} from '~/generated-metadata/graphql';
import { getApplicationCoverImageUrl } from '@/settings/applications/utils/getApplicationCoverImageUrl';
import { getApplicationDescriptionSummary } from '@/settings/applications/utils/getApplicationDescriptionSummary';

type UseApplicationOverviewArgs = {
  application?: Pick<
    Application,
    'id' | 'universalIdentifier' | 'description'
  > | null;
};

export const useApplicationOverview = ({
  application,
}: UseApplicationOverviewArgs) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: application?.universalIdentifier ?? '' },
    skip: !isNonEmptyString(application?.universalIdentifier),
  });

  const resolvedDescription = useResolvedApplicationDescription(application);

  const marketplaceDetail = data?.findMarketplaceAppDetail;

  return {
    description: getApplicationDescriptionSummary(
      marketplaceDetail?.description ?? resolvedDescription,
    ),
    coverImageUrl: getApplicationCoverImageUrl({
      application,
      currentWorkspace,
      galleryImages: marketplaceDetail?.galleryImages,
    }),
  };
};
