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
  usesSdkClient?: boolean;
  usesSharedDependencies?: boolean;
};

export const fetchFrontComponentSources = async ({
  componentUrl,
  componentSource: providedComponentSource,
  sdkClientUrls,
  sdkClientSources: providedSdkClientSources,
  sharedDependenciesUrl,
  sharedDependenciesSource: providedSharedDependenciesSource,
  applicationAccessToken,
  usesSdkClient = false,
  usesSharedDependencies = false,
}: FetchFrontComponentSourcesInput): Promise<FrontComponentSources> => {
  const headers = buildAuthorizationHeadersFromAccessToken(
    applicationAccessToken,
  );

  const earlySdkClientSourcesPromise =
    usesSdkClient &&
    isDefined(sdkClientUrls) &&
    !isDefined(providedSdkClientSources)
      ? fetchSdkClientSources({ sdkClientUrls, headers })
      : undefined;

  const earlySharedDependenciesSourcePromise =
    usesSharedDependencies &&
    isDefined(sharedDependenciesUrl) &&
    !isDefined(providedSharedDependenciesSource)
      ? fetchComponentSource({ url: sharedDependenciesUrl, headers })
      : undefined;

  earlySdkClientSourcesPromise?.catch(() => undefined);
  earlySharedDependenciesSourcePromise?.catch(() => undefined);

  const componentSource =
    providedComponentSource ??
    (await fetchComponentSource({ url: componentUrl, headers }));

  const resolveSdkClientSources = () => {
    if (isDefined(providedSdkClientSources)) {
      return providedSdkClientSources;
    }

    if (
      !isDefined(sdkClientUrls) ||
      !containsSdkClientImportSpecifier(componentSource)
    ) {
      return undefined;
    }

    return (
      earlySdkClientSourcesPromise ??
      fetchSdkClientSources({ sdkClientUrls, headers })
    );
  };

  const resolveSharedDependenciesSource = () => {
    if (isDefined(providedSharedDependenciesSource)) {
      return providedSharedDependenciesSource;
    }

    if (
      !isDefined(sharedDependenciesUrl) ||
      !containsSharedDependenciesImportSpecifier(componentSource)
    ) {
      return undefined;
    }

    return (
      earlySharedDependenciesSourcePromise ??
      fetchComponentSource({ url: sharedDependenciesUrl, headers })
    );
  };

  const [sdkClientSources, sharedDependenciesSource] = await Promise.all([
    resolveSdkClientSources(),
    resolveSharedDependenciesSource(),
  ]);

  return { componentSource, sdkClientSources, sharedDependenciesSource };
};
