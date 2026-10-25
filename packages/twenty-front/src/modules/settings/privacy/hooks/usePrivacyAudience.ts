import { useQuery } from '@apollo/client/react';

import { useIsTwentyCloud } from '@/settings/privacy/hooks/useIsTwentyCloud';
import { getPrivacyAudience } from '@/settings/privacy/utils/getPrivacyAudience';
import { RequestCountryCodeDocument } from '~/generated-metadata/graphql';

export const usePrivacyAudience = () => {
  const isTwentyCloud = useIsTwentyCloud();

  const { data, loading } = useQuery(RequestCountryCodeDocument, {
    skip: !isTwentyCloud,
  });

  return {
    privacyAudience: getPrivacyAudience(data?.requestCountryCode),
    isPrivacyAudienceLoading: loading,
  };
};
