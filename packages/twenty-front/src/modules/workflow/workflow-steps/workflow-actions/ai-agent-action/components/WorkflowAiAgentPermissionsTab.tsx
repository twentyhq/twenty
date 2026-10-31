import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { SidePanelSubPageNavigationHeader } from '@/side-panel/pages/common/components/SidePanelSubPageNavigationHeader';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsIsSystemObjectsListOpenState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsSystemObjectsListOpenState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { type WorkflowAiAgentObjectPermissionChange } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermissionChange';
import { type WorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentObjectPermission';
import { WorkflowAiAgentPermissionList } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionList';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { themeCssVariables } from 'twenty-ui/theme';
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
  readonly: boolean;
  objectPermissions: WorkflowAiAgentObjectPermission[];
  permissionFlagKeys: string[];
  onAddPermission?: (change: WorkflowAiAgentObjectPermissionChange) => void;
  onDeletePermission?: (change: WorkflowAiAgentObjectPermissionChange) => void;
  onAddPermissionFlag?: (permissionFlagKey: string) => void;
  onDeletePermissionFlag?: (permissionFlagKey: string) => void;
};

export const WorkflowAiAgentPermissionsTab = ({
  readonly,
  objectPermissions,
  permissionFlagKeys,
  onAddPermission,
  onDeletePermission,
  onAddPermissionFlag,
  onDeletePermissionFlag,
}: WorkflowAiAgentPermissionsTabProps) => {
  const [
    workflowAiAgentPermissionsSelectedObjectId,
    setWorkflowAiAgentPermissionsSelectedObjectId,
  ] = useAtomState(workflowAiAgentPermissionsSelectedObjectIdState);
  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useAtomState(workflowAiAgentPermissionsIsAddingPermissionState);
  const [
    workflowAiAgentPermissionsIsSystemObjectsListOpen,
    setWorkflowAiAgentPermissionsIsSystemObjectsListOpen,
  ] = useAtomState(workflowAiAgentPermissionsIsSystemObjectsListOpenState);

  const {
    alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems,
    objectMetadataItems: allObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const systemObjectMetadataItems = allObjectMetadataItems
    .filter((item) => item.isActive && item.isSystem)
    .sort((itemA, itemB) =>
      itemA.nameSingular.localeCompare(itemB.nameSingular),
    );

  const [searchQuery, setSearchQuery] = useState('');
  const hasPermissions =
    permissionFlagKeys.length > 0 ||
    objectPermissions.some((objectPermission) =>
      CRUD_PERMISSIONS.some(({ key }) => objectPermission[key]),
    );
  const actionPermissionsConfig = useActionRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });

  type ObjectMetadataListItem = (typeof objectMetadataItems)[number];
  const filteredObjects = filterBySearchQuery<ObjectMetadataListItem>({
    items: objectMetadataItems,
    searchQuery,
    getSearchableValues: (item) => [item.labelSingular, item.labelPlural],
  });

  const filteredSystemObjects = filterBySearchQuery({
    items: systemObjectMetadataItems,
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

  const selectedObject = isDefined(workflowAiAgentPermissionsSelectedObjectId)
    ? allObjectMetadataItems.find(
        (item) => item.id === workflowAiAgentPermissionsSelectedObjectId,
      )
    : undefined;

  const objectPermissionForSelected = isDefined(selectedObject)
    ? objectPermissions.find(
        (permission) => permission.objectMetadataId === selectedObject.id,
      )
    : undefined;

  const handleBack = () => {
    if (isDefined(workflowAiAgentPermissionsSelectedObjectId)) {
      setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
      return;
    }

    if (workflowAiAgentPermissionsIsSystemObjectsListOpen) {
      setWorkflowAiAgentPermissionsIsSystemObjectsListOpen(false);
      return;
    }

    setWorkflowAiAgentPermissionsIsAddingPermission(false);
  };

  const handleObjectClick = (objectId: string) => {
    setWorkflowAiAgentPermissionsSelectedObjectId(objectId);
  };

  const shouldShowBackButton =
    isDefined(workflowAiAgentPermissionsSelectedObjectId) ||
    workflowAiAgentPermissionsIsSystemObjectsListOpen ||
    workflowAiAgentPermissionsIsAddingPermission;
  const shouldShowCrudList = isDefined(selectedObject);
  const shouldShowSelectionLists =
    (!hasPermissions || workflowAiAgentPermissionsIsAddingPermission) &&
    !isDefined(selectedObject);
  const shouldShowExistingPermissions =
    hasPermissions && !workflowAiAgentPermissionsIsAddingPermission;

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
            onAddPermission={onAddPermission}
            objectMetadataId={selectedObject.id}
          />
        )}

        {shouldShowSelectionLists &&
          (workflowAiAgentPermissionsIsSystemObjectsListOpen ? (
            <WorkflowAiAgentPermissionsObjectsList
              heading={t`System objects`}
              objects={filteredSystemObjects}
              onObjectClick={handleObjectClick}
              readonly={readonly}
            />
          ) : (
            <>
              <WorkflowAiAgentPermissionsObjectsList
                objects={filteredObjects}
                onObjectClick={handleObjectClick}
                onSystemObjectsClick={() =>
                  setWorkflowAiAgentPermissionsIsSystemObjectsListOpen(true)
                }
                readonly={readonly}
              />
              <WorkflowAiAgentPermissionsFlagList
                title={t`Actions`}
                permissions={filteredActionPermissions}
                enabledPermissionFlagKeys={permissionFlagKeys}
                readonly={readonly}
                onAddPermissionFlag={onAddPermissionFlag}
              />
            </>
          ))}

        {shouldShowExistingPermissions && (
          <>
            <WorkflowAiAgentPermissionList
              readonly={readonly}
              objectPermissions={objectPermissions}
              onDeletePermission={onDeletePermission}
              searchQuery={searchQuery}
            />
            <WorkflowAiAgentPermissionsFlagList
              title={t`Actions`}
              permissions={filteredEnabledActionPermissions}
              enabledPermissionFlagKeys={permissionFlagKeys}
              readonly={readonly}
              showDeleteButton={!readonly}
              onDeletePermissionFlag={onDeletePermissionFlag}
            />
          </>
        )}
      </StyledGroupsContainer>
    </StyledContainer>
  );
};
