import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreWorkflowVersionCard } from '@/object-core/workflows/versions/components/CoreWorkflowVersionCard';
import { CoreWorkflowVersionRestoreButton } from '@/object-core/workflows/versions/components/CoreWorkflowVersionRestoreButton';
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
  const coreWorkflowVersionId = useSidePanelWorkflowVersionIdOrThrow();
  const { coreWorkflowVersion } = useCoreWorkflowVersion(coreWorkflowVersionId);

  if (!isDefined(coreWorkflowVersion)) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledActions>
        <StyledSpacer />
        {isDefined(coreWorkflowVersion.coreWorkflowId) && (
          <CoreWorkflowVersionRestoreButton
            workflowId={coreWorkflowVersion.coreWorkflowId}
            coreWorkflowVersionId={coreWorkflowVersionId}
          />
        )}
      </StyledActions>
      <CoreWorkflowVersionCard coreWorkflowVersionId={coreWorkflowVersionId} />
    </StyledContainer>
  );
};
