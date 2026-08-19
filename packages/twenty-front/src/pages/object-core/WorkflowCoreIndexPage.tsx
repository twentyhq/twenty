import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { IconSettingsAutomation } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { WorkflowCoreTable } from '@/object-core/workflows/components/WorkflowCoreTable';
import { useCoreWorkflows } from '@/object-core/workflows/hooks/useCoreWorkflows';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
    <StyledPage>
      <StyledHeader>
        <IconSettingsAutomation size={16} />
        {t`Workflows`}
      </StyledHeader>
      <WorkflowCoreTable coreWorkflows={coreWorkflows} />
    </StyledPage>
  );
};
