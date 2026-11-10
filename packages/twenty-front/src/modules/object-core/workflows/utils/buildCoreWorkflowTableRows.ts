import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { type CoreWorkflowRunSummary } from '@/object-core/workflows/types/CoreWorkflowRunSummary';
import { type CoreWorkflowTableRow } from '@/object-core/workflows/types/CoreWorkflowTableRow';

export const buildCoreWorkflowTableRows = ({
  coreWorkflows,
  runSummaryByCoreWorkflowId,
}: {
  coreWorkflows: CoreWorkflow[];
  runSummaryByCoreWorkflowId: Map<string, CoreWorkflowRunSummary>;
}): CoreWorkflowTableRow[] =>
  coreWorkflows.map((coreWorkflow) => {
    const runSummary = runSummaryByCoreWorkflowId.get(coreWorkflow.id);

    if (!isDefined(runSummary)) {
      return {
        ...coreWorkflow,
        recentRuns: null,
        lastRunAt: null,
        runCountLast14Days: null,
        isRunCountLowerBound: false,
      };
    }

    return {
      ...coreWorkflow,
      recentRuns: runSummary.recentRuns,
      lastRunAt: runSummary.recentRuns[0]?.createdAt ?? null,
      runCountLast14Days: runSummary.runCountLast14Days,
      isRunCountLowerBound: runSummary.isRunCountLowerBound,
    };
  });
