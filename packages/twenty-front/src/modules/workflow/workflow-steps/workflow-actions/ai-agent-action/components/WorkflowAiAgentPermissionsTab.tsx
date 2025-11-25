import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { TextInput } from '@/ui/input/components/TextInput';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';
import {
  type ObjectPermission,
  useAssignRoleToAgentMutation,
  useCreateOneRoleMutation,
  useFindOneAgentQuery,
  useGetRolesQuery,
  useUpsertObjectPermissionsMutation,
} from '~/generated-metadata/graphql';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import {
  StyledLabel,
  StyledList,
  StyledText,
} from './WorkflowAiAgentPermissions.styles';
import { WorkflowAiAgentPermissionsCrudList } from './WorkflowAiAgentPermissionsCrudList';
import { WorkflowAiAgentPermissionsObjectsList } from './WorkflowAiAgentPermissionsObjectsList';
import { WorkflowAiAgentPermissionsPermissionRow } from './WorkflowAiAgentPermissionsPermissionRow';

const StyledSearchInput = styled(TextInput)`
  width: 100%;
  height: 40px;
  border-block: 1px solid ${({ theme }) => theme.border.color.medium};
  input {
    height: 40px;
    line-height: 40px;
    border: none;
    border-radius: 0;
    width: 100%;
  }
`;

const StyledBackButtonText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledBackButton = styled.button`
  width: 100%;
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  text-align: left;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledEmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const CRUD_PERMISSIONS: Array<{
  key: SettingsRoleObjectPermissionKey;
  label: (objectLabel: string) => string;
}> = [
  {
    key: 'canReadObjectRecords',
    label: (objectLabel: string) => `See ${objectLabel}`,
  },
  {
    key: 'canUpdateObjectRecords',
    label: (objectLabel: string) => `Edit ${objectLabel}`,
  },
  {
    key: 'canSoftDeleteObjectRecords',
    label: (objectLabel: string) => `Delete ${objectLabel}`,
  },
  {
    key: 'canDestroyObjectRecords',
    label: (objectLabel: string) => `Destroy ${objectLabel}`,
  },
];

type ViewMode = 'home' | 'add-permission-objects' | 'add-permission-crud';

type WorkflowAiAgentPermissionsTabProps = {
  action: WorkflowAiAgentAction;
  readonly: boolean;
  onViewModeChange?: (viewMode: ViewMode) => void;
};

export const WorkflowAiAgentPermissionsTab = ({
  action,
  readonly,
  onViewModeChange,
}: WorkflowAiAgentPermissionsTabProps) => {
  const agentId = action.settings.input.agentId;
  const { data: agentData, loading: agentLoading } = useFindOneAgentQuery({
    variables: { id: agentId || '' },
    skip: !agentId,
  });

  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery();

  const agent = agentData?.findOneAgent;

  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<
    string | undefined
  >();
  const [searchQuery, setSearchQuery] = useState('');

  const notifyViewModeChange = (viewMode: ViewMode) => {
    if (isDefined(onViewModeChange)) {
      onViewModeChange(viewMode);
    }
  };

  const handleSetIsAddingPermission = (value: boolean) => {
    setIsAddingPermission(value);
    if (value) {
      notifyViewModeChange('add-permission-objects');
    } else {
      notifyViewModeChange('home');
    }
  };

  const handleSetSelectedObjectId = (objectId: string | undefined) => {
    setSelectedObjectId(objectId);
    if (isDefined(objectId)) {
      notifyViewModeChange('add-permission-crud');
    } else {
      const hasNoRole = !isDefined(role?.id);
      const existingPermissions = getExistingPermissions();
      const cameFromEmptyState = hasNoRole && existingPermissions.length === 0;
      if (cameFromEmptyState) {
        handleSetIsAddingPermission(false);
      } else if (isAddingPermission) {
        notifyViewModeChange('add-permission-objects');
      } else {
        notifyViewModeChange('home');
      }
    }
  };

  const [createRole] = useCreateOneRoleMutation();
  const [assignRoleToAgent] = useAssignRoleToAgentMutation();
  const [upsertObjectPermissions] = useUpsertObjectPermissionsMutation();

  const role = rolesData?.getRoles.find((item) => item.id === agent?.roleId);
  const objectPermissions = role?.objectPermissions || [];

  const getExistingPermissions = () => {
    const existingPermissions: Array<{
      objectMetadataId: string;
      objectLabel: string;
      permissionKey: SettingsRoleObjectPermissionKey;
      permissionLabel: string;
    }> = [];

    objectPermissions.forEach((objectPermission) => {
      const objectMetadata = objectMetadataItems.find(
        (item) => item.id === objectPermission.objectMetadataId,
      );

      if (!objectMetadata) {
        return;
      }

      CRUD_PERMISSIONS.forEach((crud) => {
        if (objectPermission[crud.key] === true) {
          existingPermissions.push({
            objectMetadataId: objectPermission.objectMetadataId,
            objectLabel: objectMetadata.labelPlural,
            permissionKey: crud.key,
            permissionLabel: crud.label(objectMetadata.labelPlural),
          });
        }
      });
    });

    return existingPermissions;
  };

  const filteredObjects = searchQuery.trim()
    ? objectMetadataItems.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.labelSingular.toLowerCase().includes(query) ||
          item.labelPlural.toLowerCase().includes(query)
        );
      })
    : objectMetadataItems;

  const ensureRoleId = async (): Promise<string | undefined> => {
    if (isDefined(agent?.roleId)) {
      return agent.roleId;
    }

    if (!isDefined(agent) || readonly) {
      return undefined;
    }

    const agentDisplayName = agent.label ?? agent.name ?? t`Agent`;
    const roleName = `${agentDisplayName} role (${agent.id.substring(0, 8)})`;

    const roleId = v4();

    await createRole({
      variables: {
        createRoleInput: {
          id: roleId,
          label: roleName,
          description: t`Auto-generated role for ${agentDisplayName}`,
          icon: 'IconRobot',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToAgents: true,
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
        },
      },
      refetchQueries: ['GetRoles'],
    });

    await assignRoleToAgent({
      variables: { agentId: agent.id, roleId },
      refetchQueries: ['FindOneAgent', 'GetRoles'],
    });

    return roleId;
  };

  const handleAddPermission = async (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    const roleId = await ensureRoleId();

    if (!roleId) {
      return;
    }

    const objectPermission = objectPermissions.find(
      (permission) => permission.objectMetadataId === objectMetadataId,
    );

    const updates: Partial<ObjectPermission> = {
      [permissionKey]: true,
    };

    if (
      permissionKey === 'canReadObjectRecords' &&
      !isDefined(objectPermission?.canReadObjectRecords)
    ) {
      updates.canReadObjectRecords = true;
    }

    if (
      (permissionKey === 'canUpdateObjectRecords' ||
        permissionKey === 'canSoftDeleteObjectRecords' ||
        permissionKey === 'canDestroyObjectRecords') &&
      !isDefined(objectPermission?.canReadObjectRecords)
    ) {
      updates.canReadObjectRecords = true;
    }

    await upsertObjectPermissions({
      variables: {
        upsertObjectPermissionsInput: {
          roleId,
          objectPermissions: [
            {
              objectMetadataId,
              canReadObjectRecords:
                updates.canReadObjectRecords ??
                objectPermission?.canReadObjectRecords ??
                false,
              canUpdateObjectRecords:
                updates.canUpdateObjectRecords ??
                objectPermission?.canUpdateObjectRecords ??
                false,
              canSoftDeleteObjectRecords:
                updates.canSoftDeleteObjectRecords ??
                objectPermission?.canSoftDeleteObjectRecords ??
                false,
              canDestroyObjectRecords:
                updates.canDestroyObjectRecords ??
                objectPermission?.canDestroyObjectRecords ??
                false,
            },
          ],
        },
      },
      refetchQueries: ['GetRoles', 'FindOneAgent'],
    });

    handleSetIsAddingPermission(false);
    handleSetSelectedObjectId(undefined);
  };

  const handleDeletePermission = async (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    if (!isDefined(role?.id) || readonly) {
      return;
    }

    const objectPermission = objectPermissions.find(
      (permission) => permission.objectMetadataId === objectMetadataId,
    );

    if (!isDefined(objectPermission)) {
      return;
    }

    const updatedPermission: ObjectPermission = {
      objectMetadataId,
      canReadObjectRecords:
        permissionKey === 'canReadObjectRecords'
          ? false
          : (objectPermission.canReadObjectRecords ?? false),
      canUpdateObjectRecords:
        permissionKey === 'canUpdateObjectRecords'
          ? false
          : (objectPermission.canUpdateObjectRecords ?? false),
      canSoftDeleteObjectRecords:
        permissionKey === 'canSoftDeleteObjectRecords'
          ? false
          : (objectPermission.canSoftDeleteObjectRecords ?? false),
      canDestroyObjectRecords:
        permissionKey === 'canDestroyObjectRecords'
          ? false
          : (objectPermission.canDestroyObjectRecords ?? false),
    };

    if (permissionKey === 'canReadObjectRecords') {
      updatedPermission.canUpdateObjectRecords = false;
      updatedPermission.canSoftDeleteObjectRecords = false;
      updatedPermission.canDestroyObjectRecords = false;
    }

    const hasAnyPermission =
      updatedPermission.canReadObjectRecords ||
      updatedPermission.canUpdateObjectRecords ||
      updatedPermission.canSoftDeleteObjectRecords ||
      updatedPermission.canDestroyObjectRecords;

    await upsertObjectPermissions({
      variables: {
        upsertObjectPermissionsInput: {
          roleId: role.id,
          objectPermissions: hasAnyPermission ? [updatedPermission] : [],
        },
      },
      refetchQueries: ['GetRoles', 'FindOneAgent'],
    });
  };

  if (agentLoading || rolesLoading) {
    return <RightDrawerSkeletonLoader />;
  }

  if (!isDefined(agent)) {
    return null;
  }

  const existingPermissions = getExistingPermissions();
  const selectedObject = isDefined(selectedObjectId)
    ? objectMetadataItems.find((item) => item.id === selectedObjectId)
    : undefined;

  const hasNoRole = !isDefined(agent?.roleId);
  const showAddPermissionView =
    hasNoRole && existingPermissions.length === 0 && !isAddingPermission;
  const hasRole = isDefined(agent?.roleId);
  const showHomePermissionsList =
    hasRole && !isAddingPermission && !showAddPermissionView;

  const showObjectsList = isAddingPermission && !isDefined(selectedObjectId);
  const showCrudList = isAddingPermission && isDefined(selectedObjectId);

  const objectPermissionForSelected = isDefined(selectedObject)
    ? objectPermissions.find(
        (permission) => permission.objectMetadataId === selectedObject.id,
      )
    : undefined;

  return (
    <StyledContainer>
      {isAddingPermission && (
        <StyledBackButton
          onClick={() => {
            if (isDefined(selectedObjectId)) {
              handleSetSelectedObjectId(undefined);
            } else {
              handleSetIsAddingPermission(false);
            }
          }}
        >
          <IconButton Icon={IconChevronLeft} variant="tertiary" size="small" />
          <StyledBackButtonText>{t`Add permission`}</StyledBackButtonText>
        </StyledBackButton>
      )}

      <StyledSearchInput
        value={searchQuery}
        onChange={(value: string) => setSearchQuery(value)}
        placeholder={t`Type anything...`}
      />

      {showCrudList && isDefined(selectedObject) && (
        <WorkflowAiAgentPermissionsCrudList
          permissions={CRUD_PERMISSIONS.map((p) => ({
            key: p.key,
            label: p.label(selectedObject.labelPlural),
          }))}
          objectPermissions={objectPermissionForSelected}
          readonly={readonly}
          onAddPermission={handleAddPermission}
          onDeletePermission={handleDeletePermission}
          objectMetadataId={selectedObject.id}
        />
      )}

      {showObjectsList && (
        <WorkflowAiAgentPermissionsObjectsList
          objects={filteredObjects}
          onObjectClick={(objectId) => {
            handleSetSelectedObjectId(objectId);
          }}
          readonly={readonly}
        />
      )}

      {showAddPermissionView && (
        <WorkflowAiAgentPermissionsObjectsList
          objects={filteredObjects}
          onObjectClick={(objectId) => {
            handleSetIsAddingPermission(true);
            handleSetSelectedObjectId(objectId);
          }}
          readonly={readonly}
        />
      )}

      {showHomePermissionsList && (
        <div>
          <StyledLabel>CRUD</StyledLabel>
          {existingPermissions.length > 0 ? (
            <StyledList>
              {existingPermissions.map((permission) => (
                <WorkflowAiAgentPermissionsPermissionRow
                  key={`${permission.objectMetadataId}-${permission.permissionKey}`}
                  permission={{
                    key: permission.permissionKey,
                    label: permission.permissionLabel,
                  }}
                  isEnabled={true}
                  readonly={readonly}
                  onDelete={() => {
                    void handleDeletePermission(
                      permission.objectMetadataId,
                      permission.permissionKey,
                    );
                  }}
                />
              ))}
            </StyledList>
          ) : (
            <StyledList>
              <StyledEmptyState>
                <StyledText>{t`No permissions added yet`}</StyledText>
              </StyledEmptyState>
            </StyledList>
          )}
        </div>
      )}
    </StyledContainer>
  );
};
