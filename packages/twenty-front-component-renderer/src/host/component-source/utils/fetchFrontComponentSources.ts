import { isDefined } from 'twenty-shared/utils';

import { buildAuthorizationHeadersFromAccessToken } from '@/host/component-source/utils/buildAuthorizationHeadersFromAccessToken';
import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';
import { fetchSdkClientSources } from '@/host/component-source/utils/fetchSdkClientSources';
import { unwrapSettledPromiseResult } from '@/host/component-source/utils/unwrapSettledPromiseResult';
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

  const prefetchedSdkClientSourcesSettledPromise =
    shouldPrefetchSdkClientSources &&
    isDefined(sdkClientUrls) &&
    !isDefined(providedSdkClientSources)
      ? Promise.allSettled([fetchSdkClientSources({ sdkClientUrls, headers })])
      : undefined;

  const prefetchedSharedDependenciesSourceSettledPromise =
    shouldPrefetchSharedDependenciesSource &&
    isDefined(sharedDependenciesUrl) &&
    !isDefined(providedSharedDependenciesSource)
      ? Promise.allSettled([
          fetchComponentSource({ url: sharedDependenciesUrl, headers }),
        ])
      : undefined;

  const componentSource =
    providedComponentSource ??
    (await fetchComponentSource({ url: componentUrl, headers }));

  const resolveSdkClientSourcesIfImportedByComponentSource = async () => {
    if (isDefined(providedSdkClientSources)) {
      return providedSdkClientSources;
    }

    if (
      !isDefined(sdkClientUrls) ||
      !containsSdkClientImportSpecifier(componentSource)
    ) {
      return undefined;
    }

    if (!isDefined(prefetchedSdkClientSourcesSettledPromise)) {
      return fetchSdkClientSources({ sdkClientUrls, headers });
    }

    const [prefetchedSdkClientSourcesSettledResult] =
      await prefetchedSdkClientSourcesSettledPromise;

    return unwrapSettledPromiseResult(prefetchedSdkClientSourcesSettledResult);
  };

  const resolveSharedDependenciesSourceIfImportedByComponentSource =
    async () => {
      if (isDefined(providedSharedDependenciesSource)) {
        return providedSharedDependenciesSource;
      }

      if (
        !isDefined(sharedDependenciesUrl) ||
        !containsSharedDependenciesImportSpecifier(componentSource)
      ) {
        return undefined;
      }

      if (!isDefined(prefetchedSharedDependenciesSourceSettledPromise)) {
        return fetchComponentSource({ url: sharedDependenciesUrl, headers });
      }

      const [prefetchedSharedDependenciesSourceSettledResult] =
        await prefetchedSharedDependenciesSourceSettledPromise;

      return unwrapSettledPromiseResult(
        prefetchedSharedDependenciesSourceSettledResult,
      );
    };

  const [sdkClientSources, sharedDependenciesSource] = await Promise.all([
    resolveSdkClientSourcesIfImportedByComponentSource(),
    resolveSharedDependenciesSourceIfImportedByComponentSource(),
  ]);

  return { componentSource, sdkClientSources, sharedDependenciesSource };
};
