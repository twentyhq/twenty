import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { SidePanelSubPageNavigationHeader } from '@/side-panel/pages/common/components/SidePanelSubPageNavigationHeader';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { useWorkflowAiAgentPermissionActions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useWorkflowAiAgentPermissionActions';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type Agent, GetRolesDocument } from '~/generated-metadata/graphql';
import { SidePanelSkeletonLoader } from '~/loading/components/SidePanelSkeletonLoader';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { WorkflowAiAgentPermissionList } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionList';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { WorkflowAiAgentPermissionsCrudList } from './WorkflowAiAgentPermissionsCrudList';
import { WorkflowAiAgentPermissionsFlagList } from './WorkflowAiAgentPermissionsFlagList';
import { WorkflowAiAgentPermissionsObjectsList } from './WorkflowAiAgentPermissionsObjectsList';
import { getFilteredPermissions } from './workflowAiAgentPermissions.utils';

const StyledSearchInputContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-block: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  height: 40px;
  padding-inline: ${themeCssVariables.spacing[2]};
  width: 100%;

  & input {
    background-color: transparent;
    border: none;
    border-radius: 0;
    height: 40px;
    line-height: 40px;
    width: 100%;
  }
`;

const StyledBackButtonContainer = styled.div`
  & > div {
    border-bottom: none;
  }
`;

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledGroupsContainer = styled.div`
  padding: ${themeCssVariables.spacing[2]};
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
  const workflowAiAgentActionAgent = useAtomStateValue(
    workflowAiAgentActionAgentState,
  );

  const [
    workflowAiAgentPermissionsSelectedObjectId,
    setWorkflowAiAgentPermissionsSelectedObjectId,
  ] = useAtomState(workflowAiAgentPermissionsSelectedObjectIdState);
  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useAtomState(workflowAiAgentPermissionsIsAddingPermissionState);

  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const {
    data: rolesData,
    loading: rolesLoading,
    refetch: refetchRoles,
  } = useQuery(GetRolesDocument);

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
    return <SidePanelSkeletonLoader />;
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
        <StyledBackButtonContainer>
          <SidePanelSubPageNavigationHeader
            title={t`Add permission`}
            onBackClick={handleBack}
          />
        </StyledBackButtonContainer>
      )}

      <StyledSearchInputContainer>
        <TextInput
          fullWidth
          value={searchQuery}
          onChange={(value: string) => setSearchQuery(value)}
          placeholder={t`Type anything...`}
          onKeyDown={(event) => {
            if (isNonTextWritingKey(event.key)) {
              event.stopPropagation();
            }
          }}
        />
      </StyledSearchInputContainer>

      <StyledGroupsContainer>
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
      </StyledGroupsContainer>
    </StyledContainer>
  );
};
