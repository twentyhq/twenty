import { isDefined } from 'twenty-shared/utils';

import { getUniqueHttpOriginsFromUrls } from '@/host/utils/getUniqueHttpOriginsFromUrls';
import { type HostFetchPolicy } from '@/types/HostFetchPolicy';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

type BuildHostFetchPolicyInput = {
  componentUrl: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
};

export const buildHostFetchPolicyFromFrontComponentUrls = ({
  componentUrl,
  apiUrl,
  functionsBaseUrl,
  sdkClientUrls,
}: BuildHostFetchPolicyInput): HostFetchPolicy => {
  const allowedOrigins = getUniqueHttpOriginsFromUrls([
    apiUrl,
    functionsBaseUrl,
    componentUrl,
  ]);

  const fileStorageRedirectableUrls = [
    componentUrl,
    sdkClientUrls?.core,
    sdkClientUrls?.metadata,
  ].filter(isDefined);

  return { allowedOrigins, fileStorageRedirectableUrls };
};
