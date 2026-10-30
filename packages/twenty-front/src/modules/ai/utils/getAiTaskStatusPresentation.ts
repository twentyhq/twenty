import { t } from '@lingui/core/macro';
import { type SetuAiTaskProjection } from 'twenty-shared/ai';
import { type ThemeColor } from 'twenty-ui/theme';

// What the task card says about the whole task. Counts come from the steps,
// so mixed outcomes stay visible instead of collapsing into "done".
export const getAiTaskStatusPresentation = (
  task: SetuAiTaskProjection,
): { label: string; color: ThemeColor; description: string } => {
  const total = task.steps.length;
  const completed = task.steps.filter(
    (step) => step.status === 'completed',
  ).length;
  const waiting = task.steps.filter(
    (step) => step.status === 'waiting_input',
  ).length;
  const failed = task.steps.filter((step) => step.status === 'failed').length;
  const progress = t`${completed} of ${total} ready`;

  switch (task.status) {
    case 'queued':
      return {
        label: t`Queued`,
        color: 'gray',
        description: t`Waiting for a worker. You can keep chatting.`,
      };
    case 'running':
      return {
        label: progress,
        color: 'blue',
        description: t`Researching. You can keep chatting or leave; progress is saved.`,
      };
    case 'waiting_input':
    case 'waiting_approval':
      return {
        label: progress,
        color: 'orange',
        description:
          waiting === 1
            ? t`One account needs your answer before it can continue.`
            : t`${waiting} accounts need your answer before they can continue.`,
      };
    case 'completed':
      return {
        label: t`Done`,
        color: 'green',
        description: task.saveBriefsAsNotes
          ? t`All briefs are ready and saved as company notes.`
          : t`All briefs are ready. They are kept with this task, not saved to the CRM.`,
      };
    case 'partially_completed':
      return {
        label: progress,
        color: 'amber',
        description: t`${completed} ready, ${failed} could not be completed. Finished briefs are kept.`,
      };
    case 'failed':
      return {
        label: t`Failed`,
        color: 'red',
        description: t`No brief could be completed.`,
      };
    case 'cancel_requested':
      return {
        label: t`Stopping`,
        color: 'gray',
        description: t`Stopping after the current account. Finished briefs are kept.`,
      };
    case 'cancelled':
      return {
        label: t`Stopped`,
        color: 'gray',
        description:
          completed > 0
            ? t`Stopped. ${completed} finished brief(s) are kept.`
            : t`Stopped before any brief was finished.`,
      };
  }
};
