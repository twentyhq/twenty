import styled from '@emotion/styled';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { PermissionWithoutId } from '@/settings/roles/types/Permission';
import { Checkbox } from '@/ui/input/components/Checkbox';


type Permissions = {
  create: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
};

type SettingsRolePermissionsTableProps = {
  disabled?: boolean;
  permissions: PermissionWithoutId[];
  setPermissions: Dispatch<SetStateAction<PermissionWithoutId[]>>;
};

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  thead th,
  tbody td {
    padding: ${({ theme }) => theme.spacing(1)};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }

  thead div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledCell = styled.td`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckbox = styled(Checkbox)`
  justify-content: center;
`;

export const SettingsRolePermissionsTable = ({
  disabled,
  permissions,
  setPermissions,
}: SettingsRolePermissionsTableProps) => {
  const { t } = useTranslation();
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  useEffect(() => {
    const mappedPermissions = activeObjectMetadataItems.map((item) => {
      return {
        tableName: item.labelSingular,
        canCreate: false,
        canEdit: false,
        canView: false,
        canDelete: false,
      };
    });

    setPermissions(mappedPermissions as unknown as PermissionWithoutId[]);
  }, []);

  const checkRowPermissions = (
    permission: PermissionWithoutId | undefined,
  ): boolean => {
    if (!permission) return false;

    return (
      permission.canCreate &&
      permission.canDelete &&
      permission.canEdit &&
      permission.canView
    );
  };

  const checkIndividualPermission = (
    permission: PermissionWithoutId | undefined,
    index: number,
  ) => {
    if (!permission) return false;
    switch (index) {
      case 0:
        return permission.canCreate;
      case 1:
        return permission.canEdit;
      case 2:
        return permission.canView;
      case 3:
        return permission.canDelete;
      default:
        return false;
    }
  };

  const handleRowSelect = (name: string) => {
    let permissionState = true;

    const permission = permissions.find(
      (permission) => permission.tableName === name,
    );

    if (
      permission?.canCreate &&
      permission.canEdit &&
      permission.canView &&
      permission.canDelete
    ) {
      permissionState = false;
    }

    const updatedPermissions = permissions.map((row) =>
      row.tableName === name
        ? {
            ...row,
            canCreate: permissionState,
            canEdit: permissionState,
            canView: permissionState,
            canDelete: permissionState,
          }
        : row,
    );

    setPermissions(updatedPermissions);
  };

  const handleColumnSelect = (action: keyof Permissions) => {
    let permissionState = false;

    switch (action) {
      case 'create':
        permissions.forEach((permission) => {
          if (!permission.canCreate) permissionState = true;
        });
        setPermissions(
          permissions.map((row) => ({
            ...row,
            canCreate: permissionState,
          })),
        );
        return;
      case 'edit':
        permissions.forEach((permission) => {
          if (!permission.canEdit) permissionState = true;
        });
        setPermissions(
          permissions.map((row) => ({
            ...row,
            canEdit: permissionState,
          })),
        );
        return;
      case 'view':
        permissions.forEach((permission) => {
          if (!permission.canView) permissionState = true;
        });
        setPermissions(
          permissions.map((row) => ({
            ...row,
            canView: permissionState,
          })),
        );
        return;
      case 'delete':
        permissions.forEach((permission) => {
          if (!permission.canDelete) permissionState = true;
        });
        setPermissions(
          permissions.map((row) => ({
            ...row,
            canDelete: permissionState,
          })),
        );
        return;
      default:
        return;
    }
  };

  const checkColumnPermissions = (action: string): boolean => {
    let permissionState = true;

    switch (action) {
      case 'Create':
        permissions.forEach((permission) => {
          if (!permission.canCreate) {
            permissionState = false;
            return;
          }
        });
        return permissionState;
      case 'Edit':
        permissions.forEach((permission) => {
          if (!permission.canEdit) {
            permissionState = false;
            return;
          }
        });

        return permissionState;
      case 'View':
        permissions.forEach((permission) => {
          if (!permission.canView) {
            permissionState = false;
            return;
          }
        });

        return permissionState;
      case 'Delete':
        permissions.forEach((permission) => {
          if (!permission.canDelete) {
            permissionState = false;
            return;
          }
        });

        return permissionState;
      default:
        return false;
    }
  };

  const handleIndividualPermissionChange = (
    name: string,
    action: keyof Permissions,
  ) => {
    switch (action) {
      case 'create':
        setPermissions(
          permissions.map((row) =>
            row.tableName === name
              ? {
                  ...row,
                  canCreate: !row.canCreate,
                }
              : row,
          ),
        );
        return;
      case 'edit':
        setPermissions(
          permissions.map((row) =>
            row.tableName === name
              ? {
                  ...row,
                  canEdit: !row.canEdit,
                }
              : row,
          ),
        );
        return;
      case 'view':
        setPermissions(
          permissions.map((row) =>
            row.tableName === name
              ? {
                  ...row,
                  canView: !row.canView,
                }
              : row,
          ),
        );
        return;
      case 'delete':
        setPermissions(
          permissions.map((row) =>
            row.tableName === name
              ? {
                  ...row,
                  canDelete: !row.canDelete,
                }
              : row,
          ),
        );
        return;
      default:
        return;
    }
  };

  const handleTableSelect = () => {
    let permissionState = false;

    permissions.forEach((permission) => {
      if (
        !permission.canCreate ||
        !permission.canDelete ||
        !permission.canEdit ||
        !permission.canView
      )
        permissionState = true;
    });

    const updatedPermissions = permissions.map((row) => ({
      ...row,
      canCreate: permissionState,
      canEdit: permissionState,
      canView: permissionState,
      canDelete: permissionState,
    }));
    setPermissions(updatedPermissions);
  };

  const checkAllTable = () => {
    let permissionState = true;

    permissions.forEach((permission) => {
      if (
        !permission.canCreate ||
        !permission.canDelete ||
        !permission.canEdit ||
        !permission.canView
      ) {
        permissionState = false;
        return;
      }
    });

    return permissionState;
  };

  return (
    <StyledTable>
      <thead>
        <tr>
          <th>
            <div>
              <Checkbox
                checked={checkAllTable()}
                onChange={() => handleTableSelect()}
                disabled={disabled}
              />
              {t('table')}
            </div>
          </th>
          {[t('create'), t('edit'), t('view'), t('delete')].map(
            (action, index) => (
              <th key={action}>
                <div>
                  <Checkbox
                    checked={checkColumnPermissions(action)}
                    onChange={() =>
                      handleColumnSelect(
                        ['create', 'edit', 'view', 'delete'][
                          index
                        ] as keyof Permissions,
                      )
                    }
                    disabled={disabled}
                  />
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </div>
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {activeObjectMetadataItems.map((row, index) => (
          <tr key={index}>
            <StyledCell>
              <Checkbox
                checked={checkRowPermissions(
                  permissions.find(
                    (permission) => permission.tableName === row.labelSingular || permission.tableName === row.labelPlural,
                  ),
                )}
                onChange={() => handleRowSelect(row.labelSingular)}
                disabled={disabled}
              />
              {row.labelSingular}
            </StyledCell>
            {['create', 'edit', 'view', 'delete'].map((action, actionIndex) => (
              <td key={action}>
                <StyledCheckbox
                  checked={checkIndividualPermission(
                    permissions.find(
                      (permission) =>
                        permission.tableName === row.labelPlural || permission.tableName === row.labelSingular,
                    ),
                    actionIndex,
                  )}
                  onChange={() =>
                    handleIndividualPermissionChange(
                      row.labelSingular,
                      action as keyof Permissions,
                    )
                  }
                  disabled={disabled}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
};
