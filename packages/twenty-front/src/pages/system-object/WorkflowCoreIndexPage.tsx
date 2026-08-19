import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { Tag } from 'twenty-ui/data-display';
import { IconSettingsAutomation } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { SystemObjectTable } from '@/system-object-table/components/SystemObjectTable';
import { type SystemObjectTableColumn } from '@/system-object-table/types/SystemObjectTableColumn';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { GET_CORE_WORKFLOWS } from '@/workflow-core/graphql/queries/getCoreWorkflows';

type CoreWorkflow = {
  id: string;
  name: string | null;
  status: string;
  applicationName: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: string;
};

const STATUS_TAG_COLOR: Record<string, 'green' | 'yellow' | 'gray'> = {
  ACTIVE: 'green',
  DRAFT: 'yellow',
  DEACTIVATED: 'gray',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  DEACTIVATED: 'Deactivated',
};

const StyledPage = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: 39px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledMutedText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

export const WorkflowCoreIndexPage = () => {
  const apolloCoreClient = useApolloCoreClient();
  const navigate = useNavigate();

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const { data, loading } = useQuery<{ coreWorkflows: CoreWorkflow[] }>(
    GET_CORE_WORKFLOWS,
    { client: apolloCoreClient, skip: !isWorkflowCoreIndexPageEnabled },
  );

  const coreWorkflows = data?.coreWorkflows ?? [];

  const columns: SystemObjectTableColumn<CoreWorkflow>[] = [
    {
      key: 'name',
      label: 'Name',
      getSortValue: (workflow) => workflow.name,
      render: (workflow) => (
        <StyledNameCell>
          <IconSettingsAutomation size={16} />
          {workflow.name === null || workflow.name === '' ? (
            <StyledMutedText>Untitled</StyledMutedText>
          ) : (
            workflow.name
          )}
        </StyledNameCell>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 160,
      getSortValue: (workflow) => workflow.status,
      render: (workflow) => (
        <Tag
          color={STATUS_TAG_COLOR[workflow.status] ?? 'gray'}
          text={STATUS_LABEL[workflow.status] ?? workflow.status}
        />
      ),
    },
    {
      key: 'applicationName',
      label: 'App',
      width: 180,
      getSortValue: (workflow) => workflow.applicationName,
      render: (workflow) => workflow.applicationName ?? '—',
    },
    {
      key: 'updatedAt',
      label: 'Last update',
      width: 200,
      getSortValue: (workflow) => new Date(workflow.updatedAt),
      render: (workflow) =>
        new Date(workflow.updatedAt).toLocaleString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ];

  const handleWorkflowClick = (workflow: CoreWorkflow) => {
    if (workflow.workspaceWorkflowId !== null) {
      navigate(`/object/workflow/${workflow.workspaceWorkflowId}`);
    }
  };

  if (!isWorkflowCoreIndexPageEnabled) {
    return <Navigate to={AppPath.NotFound} replace />;
  }

  return (
    <StyledPage>
      <StyledHeader>
        <IconSettingsAutomation size={16} />
        Workflows
      </StyledHeader>
      <SystemObjectTable
        columns={columns}
        items={coreWorkflows}
        getItemKey={(workflow) => workflow.id}
        onItemClick={handleWorkflowClick}
        defaultSort={{ columnKey: 'updatedAt', direction: 'desc' }}
        isLoading={loading}
      />
    </StyledPage>
  );
};
