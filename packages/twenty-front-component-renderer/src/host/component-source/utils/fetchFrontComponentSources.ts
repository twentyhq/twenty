import { isDefined } from 'twenty-shared/utils';

import { buildAuthorizationHeadersFromAccessToken } from '@/host/component-source/utils/buildAuthorizationHeadersFromAccessToken';
import { createSourceFetcherWithOptionalPrefetch } from '@/host/component-source/utils/createSourceFetcherWithOptionalPrefetch';
import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';
import { fetchSdkClientSources } from '@/host/component-source/utils/fetchSdkClientSources';
import { type FrontComponentSources } from '@/types/FrontComponentSources';
import { type SdkClientSources } from '@/types/SdkClientSources';
import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { containsSdkClientImportSpecifier } from '@/utils/module-imports/containsSdkClientImportSpecifier';
import { containsSharedDependenciesImportSpecifier } from '@/utils/module-imports/containsSharedDependenciesImportSpecifier';

type FetchFrontComponentSourcesInput = {
  componentUrl: string;
  componentSource?: string;
  sdkClientUrls?: SdkClientUrls;
  sdkClientSources?: SdkClientSources;
  sharedDependenciesUrl?: string;
  sharedDependenciesSource?: string;
  applicationAccessToken?: string;
  shouldPrefetchSdkClientSources?: boolean;
  shouldPrefetchSharedDependenciesSource?: boolean;
};

export const fetchFrontComponentSources = async ({
  componentUrl,
  componentSource: providedComponentSource,
  sdkClientUrls,
  sdkClientSources: providedSdkClientSources,
  sharedDependenciesUrl,
  sharedDependenciesSource: providedSharedDependenciesSource,
  applicationAccessToken,
  shouldPrefetchSdkClientSources = false,
  shouldPrefetchSharedDependenciesSource = false,
}: FetchFrontComponentSourcesInput): Promise<FrontComponentSources> => {
  const headers = buildAuthorizationHeadersFromAccessToken(
    applicationAccessToken,
  );

  const fetchSdkClientSourcesOrAwaitPrefetch =
    isDefined(sdkClientUrls) && !isDefined(providedSdkClientSources)
      ? createSourceFetcherWithOptionalPrefetch({
          shouldPrefetch: shouldPrefetchSdkClientSources,
          fetchSource: () => fetchSdkClientSources({ sdkClientUrls, headers }),
        })
      : undefined;

  const fetchSharedDependenciesSourceOrAwaitPrefetch =
    isDefined(sharedDependenciesUrl) &&
    !isDefined(providedSharedDependenciesSource)
      ? createSourceFetcherWithOptionalPrefetch({
          shouldPrefetch: shouldPrefetchSharedDependenciesSource,
          fetchSource: () =>
            fetchComponentSource({ url: sharedDependenciesUrl, headers }),
        })
      : undefined;

  const componentSource =
    providedComponentSource ??
    (await fetchComponentSource({ url: componentUrl, headers }));

  const [sdkClientSources, sharedDependenciesSource] = await Promise.all([
    isDefined(fetchSdkClientSourcesOrAwaitPrefetch) &&
    containsSdkClientImportSpecifier(componentSource)
      ? fetchSdkClientSourcesOrAwaitPrefetch()
      : providedSdkClientSources,
    isDefined(fetchSharedDependenciesSourceOrAwaitPrefetch) &&
    containsSharedDependenciesImportSpecifier(componentSource)
      ? fetchSharedDependenciesSourceOrAwaitPrefetch()
      : providedSharedDependenciesSource,
  ]);

  return { componentSource, sdkClientSources, sharedDependenciesSource };
};
