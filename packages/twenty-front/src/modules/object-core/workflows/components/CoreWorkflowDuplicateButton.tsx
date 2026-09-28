import { useDuplicateWorkflow } from '@/workflow/hooks/useDuplicateWorkflow';
import { t } from '@lingui/core/macro';
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
  const { duplicateWorkflow } = useDuplicateWorkflow();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const navigate = useNavigateApp();
  const { enqueueToast } = useToast();

  const handleDuplicate = async () => {
    setIsDuplicating(true);

    try {
      const result = await duplicateWorkflow({
        workflowIdToDuplicate: coreWorkflowId,
        workflowVersionIdToCopy: coreWorkflowVersionId,
      });

      if (!isDefined(result?.workflowId)) {
        throw new Error('Workflow duplication returned no workflow');
      }

      navigate(AppPath.WorkflowCoreShowPage, {
        coreWorkflowId: result.workflowId,
      });
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to duplicate workflow`,
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Button disabled={isDuplicating} onClick={handleDuplicate}>
      {t`Duplicate`}
    </Button>
  );
};
