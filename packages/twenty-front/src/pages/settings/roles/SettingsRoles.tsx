import { SettingsRolesContainer } from '@/settings/roles/components/SettingsRolesContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';

export const SettingsRoles = () => {
  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRolesContainer />
    </>
  );
};
