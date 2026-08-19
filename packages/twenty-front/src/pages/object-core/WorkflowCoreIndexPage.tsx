import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconSettingsAutomation } from 'twenty-ui/icon';

import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { WorkflowCoreTableRow } from '@/object-core/workflows/components/WorkflowCoreTableRow';
import { WORKFLOW_CORE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/object-core/workflows/constants/WorkflowCoreTableGridTemplateColumns';
import { WORKFLOW_CORE_TABLE_METADATA } from '@/object-core/workflows/constants/WorkflowCoreTableMetadata';
import { useCoreWorkflows } from '@/object-core/workflows/hooks/useCoreWorkflows';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const WorkflowCoreIndexPage = () => {
  const { t } = useLingui();

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const { coreWorkflows } = useCoreWorkflows({
    skip: !isWorkflowCoreIndexPageEnabled,
  });

  if (!isWorkflowCoreIndexPageEnabled) {
    return <Navigate to={AppPath.NotFound} replace />;
  }

  return (
    <CoreObjectIndexPageLayout
      Icon={IconSettingsAutomation}
      title={t`Workflows`}
    >
      <CoreObjectTable
        items={coreWorkflows}
        tableMetadata={WORKFLOW_CORE_TABLE_METADATA}
        gridTemplateColumns={WORKFLOW_CORE_TABLE_GRID_TEMPLATE_COLUMNS}
        renderRow={(workflow) => (
          <WorkflowCoreTableRow key={workflow.id} workflow={workflow} />
        )}
      />
    </CoreObjectIndexPageLayout>
  );
};
