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

  const resolveSdkClientSources = async () => {
    if (
      !canFetchSdkClientSources ||
      !containsSdkClientImportSpecifier(componentSource)
    ) {
      return providedSdkClientSources;
    }

    return (
      prefetchedSdkClientSources ??
      fetchSdkClientSources({ sdkClientUrls, headers })
    );
  };

  const resolveSharedDependenciesSource = async () => {
    if (
      !canFetchSharedDependenciesSource ||
      !containsSharedDependenciesImportSpecifier(componentSource)
    ) {
      return providedSharedDependenciesSource;
    }

    return (
      prefetchedSharedDependenciesSource ??
      fetchComponentSource({ url: sharedDependenciesUrl, headers })
    );
  };

  const [sdkClientSources, sharedDependenciesSource] = await Promise.all([
    resolveSdkClientSources(),
    resolveSharedDependenciesSource(),
  ]);

  return { componentSource, sdkClientSources, sharedDependenciesSource };
};
