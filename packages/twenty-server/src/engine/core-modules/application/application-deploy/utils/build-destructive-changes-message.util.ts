import { type ApplicationSyncPlanDTO } from 'src/engine/core-modules/application/application-development/dtos/application-sync-plan.dto';

export const buildDestructiveChangesMessage = (
  plan: ApplicationSyncPlanDTO,
): string => {
  const destructiveLabels = plan.actions
    .filter((action) => action.severity === 'destructive')
    .map((action) => action.label ?? action.universalIdentifier)
    .join(', ');

  return `This deploy includes ${plan.summary.destructiveCount} destructive change(s) that permanently delete data (${destructiveLabels}). Re-run with allowDestructive set to true to proceed.`;
};
