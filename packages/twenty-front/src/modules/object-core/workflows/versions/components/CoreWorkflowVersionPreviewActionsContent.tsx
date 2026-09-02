import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';
import { useRestoreWorkflowVersionAsDraft } from '@/object-core/workflows/versions/hooks/useRestoreWorkflowVersionAsDraft';

const StyledContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const CoreWorkflowVersionPreviewActionsContent = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { t } = useLingui();
  const { previewedWorkflowVersion, cancelWorkflowVersionPreview } =
    usePreviewWorkflowVersion(workflowId);
  const { restoreWorkflowVersionAsDraft, isRestoring } =
    useRestoreWorkflowVersionAsDraft(workflowId);

  if (!isDefined(previewedWorkflowVersion)) {
    return null;
  }

  return (
    <StyledContainer>
      <Button
        title={t`Cancel`}
        variant="secondary"
        size="small"
        onClick={cancelWorkflowVersionPreview}
      />
      <Button
        title={t`Restore`}
        variant="primary"
        accent="blue"
        size="small"
        disabled={isRestoring}
        onClick={restoreWorkflowVersionAsDraft}
      />
    </StyledContainer>
  );
};
