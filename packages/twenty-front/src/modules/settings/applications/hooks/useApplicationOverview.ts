import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  type Application,
  FindMarketplaceAppDetailDocument,
} from '~/generated-metadata/graphql';
import { CUSTOM_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/CustomApplicationIllustrations';
import { STANDARD_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/StandardApplicationIllustrations';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';

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

  const getCoverImageUrl = () => {
    if (isNonEmptyArray(marketplaceDetail?.galleryImages)) {
      return marketplaceDetail.galleryImages[0];
    }

    if (isTwentyStandardApplication(application)) {
      return STANDARD_APPLICATION_ILLUSTRATIONS[0];
    }

    if (isWorkspaceCustomApplication(application, currentWorkspace)) {
      return CUSTOM_APPLICATION_ILLUSTRATIONS[0];
    }

    return undefined;
  };

  return {
    description: getApplicationDescriptionSummary(
      marketplaceDetail?.description ?? resolvedDescription,
    ),
    coverImageUrl: getCoverImageUrl(),
  };
};
