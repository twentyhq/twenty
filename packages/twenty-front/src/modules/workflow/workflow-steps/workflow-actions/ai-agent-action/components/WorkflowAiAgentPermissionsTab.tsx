import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { TextInput } from '@/ui/input/components/TextInput';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { useWorkflowAiAgentPermissionActions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useWorkflowAiAgentPermissionActions';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { type Agent, useGetRolesQuery } from '~/generated-metadata/graphql';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { WorkflowAiAgentPermissionList } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionList';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { WorkflowAiAgentPermissionsCrudList } from './WorkflowAiAgentPermissionsCrudList';
import { WorkflowAiAgentPermissionsFlagList } from './WorkflowAiAgentPermissionsFlagList';
import { WorkflowAiAgentPermissionsObjectsList } from './WorkflowAiAgentPermissionsObjectsList';
import { getFilteredPermissions } from './workflowAiAgentPermissions.utils';
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

type WorkflowAiAgentPermissionsTabProps = {
  action: WorkflowAiAgentAction;
  readonly: boolean;
  isAgentLoading: boolean;
  refetchAgent: () => Promise<{ data?: { findOneAgent?: Agent } }>;
};

export const WorkflowAiAgentPermissionsTab = ({
  readonly,
  isAgentLoading,
  refetchAgent,
}: WorkflowAiAgentPermissionsTabProps) => {
  const workflowAiAgentActionAgent = useRecoilValue(
    workflowAiAgentActionAgentState,
  );

  const [
    workflowAiAgentPermissionsSelectedObjectId,
    setWorkflowAiAgentPermissionsSelectedObjectId,
  ] = useRecoilState(workflowAiAgentPermissionsSelectedObjectIdState);
  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useRecoilState(workflowAiAgentPermissionsIsAddingPermissionState);

  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const {
    data: rolesData,
    loading: rolesLoading,
    refetch: refetchRoles,
  } = useGetRolesQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const role = rolesData?.getRoles.find(
    (item) => item.id === workflowAiAgentActionAgent?.roleId,
  );
  const objectPermissions = role?.objectPermissions || [];
  const permissionFlagKeys =
    role?.permissionFlags?.map((permissionFlag) => permissionFlag.flag) ?? [];
  const hasRoleWithPermissions =
    isDefined(workflowAiAgentActionAgent?.roleId) &&
    (objectPermissions.length > 0 || permissionFlagKeys.length > 0);
  const actionPermissionsConfig = useActionRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });

  type ObjectMetadataListItem = (typeof objectMetadataItems)[number];
  const filteredObjects = filterBySearchQuery<ObjectMetadataListItem>({
    items: objectMetadataItems,
    searchQuery,
    getSearchableValues: (item) => [item.labelSingular, item.labelPlural],
  });

  const {
    filteredPermissions: filteredActionPermissions,
    filteredEnabledPermissions: filteredEnabledActionPermissions,
  } = getFilteredPermissions({
    permissions: actionPermissionsConfig,
    permissionFlagKeys,
    searchQuery,
  });

  const refetchAgentAndRoles = async () => {
    await refetchRoles();
    const result = await refetchAgent();
    return {
      refetchedAgent: result?.data?.findOneAgent,
    };
  };

  const {
    handleAddPermission,
    handleDeletePermission,
    handleAddPermissionFlag,
    handleDeletePermissionFlag,
  } = useWorkflowAiAgentPermissionActions({
    readonly,
    objectPermissions,
    permissionFlagKeys,
    refetchAgentAndRoles,
  });

  if (isAgentLoading || rolesLoading) {
    return <RightDrawerSkeletonLoader />;
  }

  if (!isDefined(workflowAiAgentActionAgent)) {
    return null;
  }

  const selectedObject = isDefined(workflowAiAgentPermissionsSelectedObjectId)
    ? objectMetadataItems.find(
        (item) => item.id === workflowAiAgentPermissionsSelectedObjectId,
      )
    : undefined;

  const objectPermissionForSelected = isDefined(selectedObject)
    ? objectPermissions.find(
        (permission) => permission.objectMetadataId === selectedObject.id,
      )
    : undefined;

  const handleBack = () => {
    isDefined(workflowAiAgentPermissionsSelectedObjectId) &&
      setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
    !isDefined(workflowAiAgentPermissionsSelectedObjectId) &&
      setWorkflowAiAgentPermissionsIsAddingPermission(false);
  };

  const handleObjectClick = (objectId: string) => {
    setWorkflowAiAgentPermissionsSelectedObjectId(objectId);
  };

  const shouldShowBackButton =
    isDefined(workflowAiAgentPermissionsSelectedObjectId) ||
    workflowAiAgentPermissionsIsAddingPermission;
  const shouldShowCrudList = isDefined(selectedObject);
  const shouldShowSelectionLists =
    (!hasRoleWithPermissions || workflowAiAgentPermissionsIsAddingPermission) &&
    !isDefined(selectedObject);
  const shouldShowExistingPermissions =
    hasRoleWithPermissions && !workflowAiAgentPermissionsIsAddingPermission;

  return (
    <StyledContainer>
      {shouldShowBackButton && (
        <StyledBackButton onClick={handleBack}>
          <IconButton Icon={IconChevronLeft} variant="tertiary" size="small" />
          <StyledBackButtonText>{t`Add permission`}</StyledBackButtonText>
        </StyledBackButton>
      )}

      <StyledSearchInput
        value={searchQuery}
        onChange={(value: string) => setSearchQuery(value)}
        placeholder={t`Type anything...`}
        onKeyDown={(event) => {
          if (isNonTextWritingKey(event.key)) {
            event.stopPropagation();
          }
        }}
      />

      {shouldShowCrudList && (
        <WorkflowAiAgentPermissionsCrudList
          permissions={filterBySearchQuery({
            items: CRUD_PERMISSIONS.map((p) => ({
              key: p.key,
              label: p.label(selectedObject.labelPlural),
            })),
            searchQuery,
            getSearchableValues: (permission) => [permission.label],
          })}
          objectPermissions={objectPermissionForSelected}
          readonly={readonly}
          onAddPermission={handleAddPermission}
          objectMetadataId={selectedObject.id}
        />
      )}

      {shouldShowSelectionLists && (
        <>
          <WorkflowAiAgentPermissionsObjectsList
            objects={filteredObjects}
            onObjectClick={handleObjectClick}
            readonly={readonly}
          />
          <WorkflowAiAgentPermissionsFlagList
            title={t`Actions`}
            permissions={filteredActionPermissions}
            enabledPermissionFlagKeys={permissionFlagKeys}
            readonly={readonly}
            onAddPermissionFlag={handleAddPermissionFlag}
          />
        </>
      )}

      {shouldShowExistingPermissions && (
        <>
          <WorkflowAiAgentPermissionList
            readonly={readonly}
            objectPermissions={objectPermissions}
            onDeletePermission={handleDeletePermission}
            searchQuery={searchQuery}
          />
          <WorkflowAiAgentPermissionsFlagList
            title={t`Actions`}
            permissions={filteredEnabledActionPermissions}
            enabledPermissionFlagKeys={permissionFlagKeys}
            readonly={readonly}
            showDeleteButton={!readonly}
            onDeletePermissionFlag={handleDeletePermissionFlag}
          />
        </>
      )}
    </StyledContainer>
  );
};
