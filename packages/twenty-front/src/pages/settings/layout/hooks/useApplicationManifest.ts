import { useQuery } from '@apollo/client/react';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import {
  FindMarketplaceAppDetailDocument,
  FindOneApplicationDocument,
} from '~/generated-metadata/graphql';

// Loads the application + its marketplace manifest in two cache-first queries.
// Both are already used by the application detail page, so revisits hit the
// Apollo cache. Layout detail pages need the manifest to read entities
// (views, page layouts, navigation menu items) the GraphQL Application type
// doesn't expose.
export const useApplicationManifest = (applicationId: string) => {
  const { data: appData, loading: appLoading } = useQuery(
    FindOneApplicationDocument,
    {
      variables: { id: applicationId },
      fetchPolicy: 'cache-first',
      skip: !isDefined(applicationId) || applicationId === '',
    },
  );

  const application = appData?.findOneApplication;

  const { data: detailData, loading: detailLoading } = useQuery(
    FindMarketplaceAppDetailDocument,
    {
      variables: {
        universalIdentifier: application?.universalIdentifier ?? '',
      },
      fetchPolicy: 'cache-first',
      skip: !isDefined(application?.universalIdentifier),
    },
  );

  const manifest = detailData?.findMarketplaceAppDetail.manifest as
    | Manifest
    | undefined;

  return {
    application,
    manifest,
    isLoading: appLoading || detailLoading,
  };
};
