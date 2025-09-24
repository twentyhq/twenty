import type { WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { Suspense, lazy } from 'react';

const CronExpressionHelperComponent = lazy(() =>
  import('./CronExpressionHelper').then((module) => ({
    default: module.CronExpressionHelper,
  })),
);

type CronExpressionHelperLazyProps = {
  trigger: WorkflowCronTrigger;
  isVisible?: boolean;
};

export const CronExpressionHelperLazy = ({
  trigger,
  isVisible = true,
}: CronExpressionHelperLazyProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <CronExpressionHelperComponent trigger={trigger} isVisible={isVisible} />
    </Suspense>
  );
};
