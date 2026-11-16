import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreWorkflowVersionCard } from '@/object-core/workflows/versions/components/CoreWorkflowVersionCard';
import { CoreWorkflowVersionRestoreButton } from '@/object-core/workflows/versions/components/CoreWorkflowVersionRestoreButton';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { useSidePanelWorkflowVersionIdOrThrow } from '@/side-panel/pages/workflow/step/view/hooks/useSidePanelWorkflowVersionIdOrThrow';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledActions = styled.div`
  align-items: center;
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[3]};
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
