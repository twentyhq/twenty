import { isDefined } from 'twenty-shared/utils';

import { buildAuthorizationHeadersFromAccessToken } from '@/host/component-source/utils/buildAuthorizationHeadersFromAccessToken';
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

  const canFetchSdkClientSources =
    isDefined(sdkClientUrls) && !isDefined(providedSdkClientSources);

  const canFetchSharedDependenciesSource =
    isDefined(sharedDependenciesUrl) &&
    !isDefined(providedSharedDependenciesSource);

  const [
    componentSource,
    prefetchedSdkClientSources,
    prefetchedSharedDependenciesSource,
  ] = await Promise.all([
    providedComponentSource ??
      fetchComponentSource({ url: componentUrl, headers }),
    shouldPrefetchSdkClientSources && canFetchSdkClientSources
      ? fetchSdkClientSources({ sdkClientUrls, headers })
      : undefined,
    shouldPrefetchSharedDependenciesSource && canFetchSharedDependenciesSource
      ? fetchComponentSource({ url: sharedDependenciesUrl, headers })
      : undefined,
  ]);

  const [sdkClientSources, sharedDependenciesSource] = await Promise.all([
    canFetchSdkClientSources &&
    containsSdkClientImportSpecifier(componentSource)
      ? (prefetchedSdkClientSources ??
        fetchSdkClientSources({ sdkClientUrls, headers }))
      : providedSdkClientSources,
    canFetchSharedDependenciesSource &&
    containsSharedDependenciesImportSpecifier(componentSource)
      ? (prefetchedSharedDependenciesSource ??
        fetchComponentSource({ url: sharedDependenciesUrl, headers }))
      : providedSharedDependenciesSource,
  ]);

  return { componentSource, sdkClientSources, sharedDependenciesSource };
};
