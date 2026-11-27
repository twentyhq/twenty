import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { billingState } from '@/client-config/states/billingState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { getSettingsSearchDestinations } from '@/settings/search/utils/getSettingsSearchDestinations';
import { searchSettingsDestinations } from '@/settings/search/utils/searchSettingsDestinations';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

const MAX_SETTINGS_SEARCH_RESULTS = 6;

export const useSettingsSearchResults = ({
  search,
  excludedPaths,
}: {
  search: string;
  excludedPaths: string[];
}) => {
  const { i18n } = useLingui();
  const routeObjects = useWorkspaceRouteObjects();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const featureFlagsMap = useWorkspaceFeatureFlagsMap();
  const isBillingEnabled =
    useAtomStateValue(billingState)?.isBillingEnabled ?? false;
  const { objectMetadataItems } = useObjectMetadataItems();

  const destinations = useMemo(
    () =>
      getSettingsSearchDestinations({
        routeObjects,
        availability: {
          permissionFlagMap,
          featureFlagsMap,
          isBillingEnabled,
          objectMetadataItems: objectMetadataItems.filter(
            ({ isActive, isSystem }) => isActive && !isSystem,
          ),
        },
        i18n,
      }),
    [
      routeObjects,
      permissionFlagMap,
      featureFlagsMap,
      isBillingEnabled,
      objectMetadataItems,
      i18n,
    ],
  );

  return searchSettingsDestinations({
    destinations: destinations.filter(
      (destination) => !excludedPaths.includes(destination.path),
    ),
    search,
  }).slice(0, MAX_SETTINGS_SEARCH_RESULTS);
};
