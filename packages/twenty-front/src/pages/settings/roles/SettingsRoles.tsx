import { RolesContainer } from '@/settings/roles/components/RolesContainer';
import { RolesQueryEffect } from '@/settings/roles/components/RolesQueryEffect';

export const SettingsRoles = () => {
  return (
    <>
      <RolesQueryEffect />
      <RolesContainer />
    </>
  );
};
