import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
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
import { useGetRolesQuery } from '~/generated-metadata/graphql';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';

import { WorkflowAiAgentPermissionList } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionList';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { WorkflowAiAgentPermissionsCrudList } from './WorkflowAiAgentPermissionsCrudList';
import { WorkflowAiAgentPermissionsObjectsList } from './WorkflowAiAgentPermissionsObjectsList';
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
  refetchAgent: () => Promise<unknown>;
};

export const WorkflowAiAgentPermissionsTab = ({
  action,
  readonly,
  isAgentLoading,
  refetchAgent,
}: WorkflowAiAgentPermissionsTabProps) => {
  const agent = useRecoilValue(workflowAiAgentActionAgentState(action.id));
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

  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const role = rolesData?.getRoles.find((item) => item.id === agent?.roleId);
  const objectPermissions = role?.objectPermissions || [];

  const filteredObjects = searchQuery.trim()
    ? objectMetadataItems.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.labelSingular.toLowerCase().includes(query) ||
          item.labelPlural.toLowerCase().includes(query)
        );
      })
    : objectMetadataItems;

  const { handleAddPermission, handleDeletePermission } =
    useWorkflowAiAgentPermissionActions({
      agent,
      readonly,
      objectPermissions,
      refetchAgent,
    });

  if (isAgentLoading || rolesLoading) {
    return <RightDrawerSkeletonLoader />;
  }

  if (!isDefined(agent)) {
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

  return (
    <StyledContainer>
      {(isDefined(workflowAiAgentPermissionsSelectedObjectId) ||
        workflowAiAgentPermissionsIsAddingPermission) && (
        <StyledBackButton onClick={handleBack}>
          <IconButton Icon={IconChevronLeft} variant="tertiary" size="small" />
          <StyledBackButtonText>{t`Add permission`}</StyledBackButtonText>
        </StyledBackButton>
      )}

      <StyledSearchInput
        value={searchQuery}
        onChange={(value: string) => setSearchQuery(value)}
        placeholder={t`Type anything...`}
      />

      {isDefined(selectedObject) &&
        workflowAiAgentPermissionsIsAddingPermission && (
          <WorkflowAiAgentPermissionsCrudList
            permissions={CRUD_PERMISSIONS.map((p) => ({
              key: p.key,
              label: p.label(selectedObject.labelPlural),
            }))}
            objectPermissions={objectPermissionForSelected}
            readonly={readonly}
            onAddPermission={handleAddPermission}
            objectMetadataId={selectedObject.id}
          />
        )}

      {(!agent.roleId || workflowAiAgentPermissionsIsAddingPermission) &&
        !isDefined(selectedObject) && (
          <WorkflowAiAgentPermissionsObjectsList
            objects={filteredObjects}
            onObjectClick={handleObjectClick}
            readonly={readonly}
          />
        )}

      {isDefined(agent.roleId) &&
        !workflowAiAgentPermissionsIsAddingPermission && (
          <WorkflowAiAgentPermissionList
            readonly={readonly}
            objectPermissions={objectPermissions}
            onDeletePermission={handleDeletePermission}
          />
        )}
    </StyledContainer>
  );
};
