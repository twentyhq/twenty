import { useDuplicateWorkflow } from '@/workflow/hooks/useDuplicateWorkflow';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type CoreWorkflowDuplicateButtonProps = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
};

export const CoreWorkflowDuplicateButton = ({
  coreWorkflowId,
  coreWorkflowVersionId,
}: CoreWorkflowDuplicateButtonProps) => {
  const { t } = useLingui();
  const { duplicateWorkflow } = useDuplicateWorkflow();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const navigate = useNavigateApp();
  const { enqueueToast } = useToast();

  const handleDuplicate = async () => {
    setIsDuplicating(true);

    const result = await duplicateWorkflow({
      workflowIdToDuplicate: coreWorkflowId,
      workflowVersionIdToCopy: coreWorkflowVersionId,
    }).catch(() => undefined);

    setIsDuplicating(false);

    if (!isDefined(result) || !isNonEmptyString(result.workflowId)) {
      enqueueToast({
        variant: 'error',
        children: t`Failed to duplicate workflow`,
      });
      return;
    }

    enqueueToast({
      variant: 'success',
      children: t`Workflow duplicated successfully`,
    });
    navigate(AppPath.WorkflowCoreShowPage, {
      coreWorkflowId: result.workflowId,
    });
  };

  return (
    <Button size="sm" disabled={isDuplicating} onClick={handleDuplicate}>
      {t`Duplicate`}
    </Button>
  );
};
