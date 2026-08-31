import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type RoleLinkProps = {
  roleId: string;
  displayName: string;
};

export const RoleLink = ({ roleId, displayName }: RoleLinkProps) => {
  const theme = useTheme();
  const hasRolesPermission = useHasPermissionFlag(PermissionFlagType.ROLES);

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={
        hasRolesPermission
          ? getSettingsPath(SettingsPath.RoleDetail, { roleId })
          : undefined
      }
      leftComponent={
        <IconLock size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    />
  );
};
