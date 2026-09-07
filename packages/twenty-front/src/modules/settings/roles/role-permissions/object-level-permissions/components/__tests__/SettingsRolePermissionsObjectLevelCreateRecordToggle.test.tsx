import { render, screen, fireEvent } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SettingsRolePermissionsObjectLevelCreateRecordToggle } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelCreateRecordToggle';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermission, type Role } from '~/generated-metadata/graphql';

const ROLE_ID = 'test-role-id';

const mockObjectMetadataItem = {
  id: 'object-1',
  labelPlural: 'Companies',
  isUICreatable: true,
  isUIEditable: true,
  isSystem: false,
  isRemote: false,
} as EnrichedObjectMetadataItem;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('SettingsRolePermissionsObjectLevelCreateRecordToggle', () => {
  beforeAll(() => {
    if (typeof window.PointerEvent === 'undefined') {
      window.PointerEvent = window.MouseEvent as any;
    }
  });

  beforeEach(() => {
    resetJotaiStore();
  });

  it('should render toggle checked by default when permission is not explicitly false', () => {
    const draftRole: Role = {
      id: ROLE_ID,
      isEditable: true,
      label: 'Custom Role',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToUsers: true,
      agents: [],
      apiKeys: [],
      workspaceMembers: [],
      fieldPermissions: [],
      objectPermissions: [],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [],
    };

    jotaiStore.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), draftRole);

    render(
      <SettingsRolePermissionsObjectLevelCreateRecordToggle
        roleId={ROLE_ID}
        objectMetadataItem={mockObjectMetadataItem}
        isEditable={true}
      />,
      { wrapper: Wrapper },
    );

    const toggle = screen.getByRole('switch', {
      name: /Toggle create records for Companies/i,
    });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).not.toHaveAttribute('data-disabled');
  });

  it('should render toggle unchecked when canCreateObjectRecords is false', () => {
    const draftRole: Role = {
      id: ROLE_ID,
      isEditable: true,
      label: 'Custom Role',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToUsers: true,
      agents: [],
      apiKeys: [],
      workspaceMembers: [],
      fieldPermissions: [],
      objectPermissions: [
        {
          id: 'perm-1',
          objectMetadataId: mockObjectMetadataItem.id,
          canCreateObjectRecords: false,
        } as any,
      ],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [],
    };

    jotaiStore.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), draftRole);

    render(
      <SettingsRolePermissionsObjectLevelCreateRecordToggle
        roleId={ROLE_ID}
        objectMetadataItem={mockObjectMetadataItem}
        isEditable={true}
      />,
      { wrapper: Wrapper },
    );

    const toggle = screen.getByRole('switch', {
      name: /Toggle create records for Companies/i,
    });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('should be disabled when isEditable is false or object is not UICreatable', () => {
    const draftRole: Role = {
      id: ROLE_ID,
      isEditable: false,
      label: 'System Role',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToUsers: true,
      agents: [],
      apiKeys: [],
      workspaceMembers: [],
      fieldPermissions: [],
      objectPermissions: [],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [],
    };

    jotaiStore.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), draftRole);

    const { rerender } = render(
      <SettingsRolePermissionsObjectLevelCreateRecordToggle
        roleId={ROLE_ID}
        objectMetadataItem={mockObjectMetadataItem}
        isEditable={false}
      />,
      { wrapper: Wrapper },
    );

    const toggle = screen.getByRole('switch', {
      name: /Toggle create records for Companies/i,
    });
    expect(toggle).toHaveAttribute('data-disabled', '');

    rerender(
      <SettingsRolePermissionsObjectLevelCreateRecordToggle
        roleId={ROLE_ID}
        objectMetadataItem={{ ...mockObjectMetadataItem, isUICreatable: false }}
        isEditable={true}
      />,
    );

    expect(toggle).toHaveAttribute('data-disabled', '');
  });

  it('should update draft role objectPermissions when toggled', () => {
    const draftRole: Role = {
      id: ROLE_ID,
      isEditable: true,
      label: 'Custom Role',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToUsers: true,
      agents: [],
      apiKeys: [],
      workspaceMembers: [],
      fieldPermissions: [],
      objectPermissions: [],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [],
    };

    jotaiStore.set(settingsDraftRoleFamilyState.atomFamily(ROLE_ID), draftRole);

    render(
      <SettingsRolePermissionsObjectLevelCreateRecordToggle
        roleId={ROLE_ID}
        objectMetadataItem={mockObjectMetadataItem}
        isEditable={true}
      />,
      { wrapper: Wrapper },
    );

    const toggle = screen.getByRole('switch', {
      name: /Toggle create records for Companies/i,
    });

    fireEvent.click(toggle);

    const updatedDraftRole = jotaiStore.get(
      settingsDraftRoleFamilyState.atomFamily(ROLE_ID),
    );

    const perm = updatedDraftRole.objectPermissions?.find(
      (p) => p.objectMetadataId === mockObjectMetadataItem.id,
    ) as
      | (ObjectPermission & { canCreateObjectRecords?: boolean | null })
      | undefined;

    expect(perm?.canCreateObjectRecords).toBe(false);
  });
});
