import { ROLE_SETTINGS_DELETE_ROLE_CONFIRMATION_MODAL_ID } from '@/settings/roles/role-settings/components/constants/RoleSettingsDeleteRoleConfirmationModalId';
import { SettingsRoleSettingsDeleteRoleConfirmationModalSubtitle } from '@/settings/roles/role-settings/components/SettingsRoleSettingsDeleteRoleConfirmationModalSubtitle';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useDeleteOneRoleMutation } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsRoleSettingsDeleteRoleConfirmationModalProps = {
  roleId: string;
};

export const SettingsRoleSettingsDeleteRoleConfirmationModal = ({
  roleId,
}: SettingsRoleSettingsDeleteRoleConfirmationModalProps) => {
  const [deleteRole] = useDeleteOneRoleMutation();

  const navigateSettings = useNavigateSettings();

  const handleConfirmClick = async () => {
    await deleteRole({
      variables: { roleId },
    });
    navigateSettings(SettingsPath.Roles);
  };

  return (
    <ConfirmationModal
      modalId={ROLE_SETTINGS_DELETE_ROLE_CONFIRMATION_MODAL_ID}
      title={t`Delete Role Permanently`}
      subtitle={
        <SettingsRoleSettingsDeleteRoleConfirmationModalSubtitle
          roleId={roleId}
        />
      }
      onConfirmClick={handleConfirmClick}
      confirmButtonText={t`Confirm`}
      confirmButtonAccent="danger"
    />
  );
};
