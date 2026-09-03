import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CoreWorkflowVersionCard } from '@/object-core/workflows/versions/components/CoreWorkflowVersionCard';
import { CoreWorkflowVersionRestoreButton } from '@/object-core/workflows/versions/components/CoreWorkflowVersionRestoreButton';
import { CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusTagProps';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { useSidePanelWorkflowVersionIdOrThrow } from '@/side-panel/pages/workflow/step/view/hooks/useSidePanelWorkflowVersionIdOrThrow';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledActions = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledSpacer = styled.div`
  margin-left: auto;
`;

export const SidePanelCoreWorkflowVersionPage = () => {
  const { t } = useLingui();
  const workspaceWorkflowVersionId = useSidePanelWorkflowVersionIdOrThrow();
  const { coreWorkflowVersion } = useCoreWorkflowVersion(
    workspaceWorkflowVersionId,
  );

  if (!isDefined(coreWorkflowVersion)) {
    return null;
  }

  const tagProps =
    CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS[coreWorkflowVersion.status];

  return (
    <StyledContainer>
      <StyledActions>
        <Tag color={tagProps.color} text={t(tagProps.label)} />
        <StyledSpacer />
        <CoreWorkflowVersionRestoreButton
          workflowId={coreWorkflowVersion.workspaceWorkflowId}
          workspaceWorkflowVersionId={workspaceWorkflowVersionId}
        />
      </StyledActions>
      <CoreWorkflowVersionCard
        workspaceWorkflowVersionId={workspaceWorkflowVersionId}
      />
    </StyledContainer>
  );
};
