import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useIsLogConsoleAllowed = () => {
  const isLogsSettingsSectionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED,
  );
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );
  const isMobile = useIsMobile();

  return (
    isLogsSettingsSectionEnabled &&
    isAdvancedModeEnabled &&
    hasSecurityPermission &&
    !isMobile
  );
};
