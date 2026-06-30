import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';

import { DISMISS_MAINTENANCE_MODE_BANNER } from '@/information-banner/graphql/mutations/dismissMaintenanceModeBanner';
import { IS_MAINTENANCE_MODE_BANNER_DISMISSED } from '@/information-banner/graphql/queries/isMaintenanceModeBannerDismissed';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';

export const useMaintenanceModeBannerDismissal = ({
  enabled,
  maintenanceStartAt,
}: {
  enabled: boolean;
  maintenanceStartAt?: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();
  const [isDismissed, setIsDismissed] = useState(false);

  const { data, loading, refetch } = useQuery<{
    isMaintenanceModeBannerDismissed: boolean;
  }>(IS_MAINTENANCE_MODE_BANNER_DISMISSED, {
    client: apolloCoreClient,
    skip: !enabled,
    fetchPolicy: 'network-only',
  });

  const [mutate] = useMutation<{
    dismissMaintenanceModeBanner: boolean;
  }>(DISMISS_MAINTENANCE_MODE_BANNER, {
    client: apolloCoreClient,
  });

  useEffect(() => {
    if (!enabled) {
      setIsDismissed(false);

      return;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    setIsDismissed(false);
    void refetch();
  }, [enabled, maintenanceStartAt, refetch]);

  const dismissBanner = async () => {
    await mutate();
    setIsDismissed(true);
  };

  return {
    dismissBanner,
    isDismissed: isDismissed || data?.isMaintenanceModeBannerDismissed === true,
    isLoading: enabled ? loading : false,
  };
};
