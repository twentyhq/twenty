import { getURLSafely, isDefined } from 'twenty-shared/utils';

import { type SdkClientUrls } from '@/types/SdkClientUrls';

type BuildHostFetchPolicyInput = {
  componentUrl: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
};

type HostFetchPolicy = {
  allowedOrigins: string[];
  fileStorageRedirectableUrls: string[];
};

export const buildHostFetchPolicy = ({
  componentUrl,
  apiUrl,
  functionsBaseUrl,
  sdkClientUrls,
}: BuildHostFetchPolicyInput): HostFetchPolicy => {
  const allowedOrigins = [
    ...new Set(
      [apiUrl, functionsBaseUrl, componentUrl]
        .filter(isDefined)
        .map((url) => getURLSafely(url)?.origin)
        .filter(isDefined),
    ),
  ];

  const fileStorageRedirectableUrls = [
    componentUrl,
    sdkClientUrls?.core,
    sdkClientUrls?.metadata,
  ].filter(isDefined);

  return { allowedOrigins, fileStorageRedirectableUrls };
};
