import { isDefined } from 'twenty-shared/utils';

import { getUniqueHttpOriginsFromUrls } from '@/host/fetch/utils/getUniqueHttpOriginsFromUrls';
import { type HostFetchPolicy } from '@/types/HostFetchPolicy';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

type BuildHostFetchPolicyInput = {
  componentUrl: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  sharedDependenciesUrl?: string;
};

export const buildHostFetchPolicyFromFrontComponentUrls = ({
  componentUrl,
  apiUrl,
  functionsBaseUrl,
  sdkClientUrls,
  sharedDependenciesUrl,
}: BuildHostFetchPolicyInput): HostFetchPolicy => {
  const allowedOrigins = getUniqueHttpOriginsFromUrls([
    apiUrl,
    functionsBaseUrl,
    componentUrl,
    sharedDependenciesUrl,
  ]);

  const fileStorageRedirectableUrls = [
    componentUrl,
    sdkClientUrls?.core,
    sdkClientUrls?.metadata,
    sharedDependenciesUrl,
  ].filter(isDefined);

  return { allowedOrigins, fileStorageRedirectableUrls };
};
