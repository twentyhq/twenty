import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelSubPageNavigationHeader } from '@/side-panel/pages/common/components/SidePanelSubPageNavigationHeader';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsIsSystemObjectsListOpenState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsSystemObjectsListOpenState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { type AiRunScope } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { useWorkflowAiAgentScopePermissionActions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useWorkflowAiAgentScopePermissionActions';
import { getWorkflowAiAgentScopePermissions } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/getWorkflowAiAgentScopePermissions';
import { WorkflowAiAgentPermissionList } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionList';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';
import { WorkflowAiAgentPermissionsCrudList } from './WorkflowAiAgentPermissionsCrudList';
import { WorkflowAiAgentPermissionsFlagList } from './WorkflowAiAgentPermissionsFlagList';
import { WorkflowAiAgentPermissionsObjectsList } from './WorkflowAiAgentPermissionsObjectsList';

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
  scope: AiRunScope | undefined;
  readonly: boolean;
  onScopeChange: (scope: AiRunScope) => void;
};

export const WorkflowAiAgentPermissionsTab = ({
  scope,
  readonly,
  onScopeChange,
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
  const { objectPermissions, permissionFlagKeys, otherPermissionLabels } =
    getWorkflowAiAgentScopePermissions({
      scope,
      objectMetadataItems: allObjectMetadataItems,
    });
  const {
    onAddPermission,
    onDeletePermission,
    onAddPermissionFlag,
    onDeletePermissionFlag,
  } = useWorkflowAiAgentScopePermissionActions({ scope, onScopeChange });

  const systemObjectMetadataItems = allObjectMetadataItems
    .filter((item) => item.isActive && item.isSystem)
    .sort((itemA, itemB) =>
      itemA.nameSingular.localeCompare(itemB.nameSingular),
    );

  const [searchQuery, setSearchQuery] = useState('');
  const hasPermissions =
    permissionFlagKeys.length > 0 ||
    otherPermissionLabels.length > 0 ||
    objectPermissions.some((objectPermission) =>
      CRUD_PERMISSIONS.some(({ key }) => objectPermission[key]),
    );
  const agentActionPermissionsConfig = useActionRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });
  const actionPermissionsConfig = useActionRolePermissionFlagConfig();
  const settingsPermissionsConfig = useSettingsRolePermissionFlagConfig();

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

  const filterPermissionsBySearchQuery = (
    permissions: typeof actionPermissionsConfig,
  ) =>
    filterBySearchQuery({
      items: permissions,
      searchQuery,
      getSearchableValues: (permission) => [permission.name],
    });

  const filterEnabledPermissions = (
    permissions: typeof actionPermissionsConfig,
  ) =>
    filterPermissionsBySearchQuery(
      permissions.filter((permission) =>
        permissionFlagKeys.includes(permission.key),
      ),
    );

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
                permissions={filterPermissionsBySearchQuery(
                  agentActionPermissionsConfig,
                )}
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
              permissions={filterEnabledPermissions(actionPermissionsConfig)}
              enabledPermissionFlagKeys={permissionFlagKeys}
              readonly={readonly}
              shouldShowDeleteButton={!readonly}
              onDeletePermissionFlag={onDeletePermissionFlag}
            />
            <WorkflowAiAgentPermissionsFlagList
              title={t`Settings`}
              permissions={filterEnabledPermissions(settingsPermissionsConfig)}
              enabledPermissionFlagKeys={permissionFlagKeys}
              readonly={readonly}
              shouldShowDeleteButton={!readonly}
              onDeletePermissionFlag={onDeletePermissionFlag}
            />
            {otherPermissionLabels.length > 0 && (
              <SidePanelGroup heading={t`Other permissions`}>
                {otherPermissionLabels.map((label) => (
                  <ListItem key={label} disabled>
                    {label}
                  </ListItem>
                ))}
              </SidePanelGroup>
            )}
          </>
        )}
      </StyledGroupsContainer>
    </StyledContainer>
  );
};
