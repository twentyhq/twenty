import { render, screen } from '@testing-library/react';
import { SettingsRolePermissionsObjectLevelTableHeader } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelTableHeader';

describe('SettingsRolePermissionsObjectLevelTableHeader', () => {
  it('should render all column headers including Create Records', () => {
    render(
      <SettingsRolePermissionsObjectLevelTableHeader
        showPermissionsLabel={true}
      />,
    );

    expect(screen.getByText('Object-Level')).toBeInTheDocument();
    expect(screen.getByText('Records')).toBeInTheDocument();
    expect(screen.getByText('Create Records')).toBeInTheDocument();
    expect(screen.getByText('See Fields')).toBeInTheDocument();
    expect(screen.getByText('Edit Fields')).toBeInTheDocument();
  });

  it('should render empty labels when showPermissionsLabel is false', () => {
    render(
      <SettingsRolePermissionsObjectLevelTableHeader
        showPermissionsLabel={false}
      />,
    );

    expect(screen.getByText('Object-Level')).toBeInTheDocument();
    expect(screen.queryByText('Create Records')).not.toBeInTheDocument();
  });
});
