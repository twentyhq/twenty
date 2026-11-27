import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useOpenRowLevelPermissionRulePage = ({
  roleId,
  objectMetadataId,
}: {
  roleId: string;
  objectMetadataId: string;
}) => {
  const navigateSettings = useNavigateSettings();

  const openRowLevelPermissionRulePage = (rowLevelPermissionRuleId: string) => {
    navigateSettings(
      SettingsPath.RoleRule,
      { roleId, objectMetadataId },
      { rowLevelPermissionRuleId },
    );
  };

  return { openRowLevelPermissionRulePage };
};
