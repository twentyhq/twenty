import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
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
  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );
  const isMobile = useIsMobile();

  return isLogsSettingsSectionEnabled && hasSecurityPermission && !isMobile;
};
