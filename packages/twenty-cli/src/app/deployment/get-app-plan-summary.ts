import { isDestructiveAppPlanAction } from '@/app/deployment/is-destructive-app-plan-action';
import { resolveAppPlanCascades } from '@/app/deployment/resolve-app-plan-cascades';
import {
  type AppPlanAction,
  type AppPlanSummary,
} from '@/app/deployment/types/app-plan.type';

// destructive counts the deletions that drop stored data on their own: the
// fields of a dropped table go with it and are only counted as cascaded.
export const getAppPlanSummary = (actions: AppPlanAction[]): AppPlanSummary => {
  const cascades = resolveAppPlanCascades(actions);
  const summary = {
    create: 0,
    update: 0,
    delete: 0,
    destructive: 0,
    cascaded: cascades.size,
  };

  for (const action of actions) {
    summary[action.type] += 1;

    if (isDestructiveAppPlanAction(action) && !cascades.has(action)) {
      summary.destructive += 1;
    }
  }

  return summary;
};
