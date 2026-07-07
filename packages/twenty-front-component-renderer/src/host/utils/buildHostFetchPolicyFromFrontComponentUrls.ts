import { getURLSafely, isDefined } from 'twenty-shared/utils';

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
  const allowedOrigins = [
    ...new Set(
      [apiUrl, functionsBaseUrl, componentUrl]
        .filter(isDefined)
        .map((url) => getURLSafely(url))
        .filter(isDefined)
        .filter((url) => url.protocol === 'http:' || url.protocol === 'https:')
        .map((url) => url.origin),
    ),
  ];

  const fileStorageRedirectableUrls = [
    componentUrl,
    sdkClientUrls?.core,
    sdkClientUrls?.metadata,
  ].filter(isDefined);

  return { allowedOrigins, fileStorageRedirectableUrls };
};
