import { groupAppPlanCascades } from '@/app/deployment/group-app-plan-cascades';
import { isDestructiveAppPlanAction } from '@/app/deployment/is-destructive-app-plan-action';
import {
  type AppPlanAction,
  type AppPlanSummary,
} from '@/app/deployment/types/app-plan.type';

// destructive skips cascaded deletions, such as the columns of a dropped table.
export const getAppPlanSummary = (actions: AppPlanAction[]): AppPlanSummary => {
  const { primaryActions } = groupAppPlanCascades(actions);
  const summary = {
    create: 0,
    update: 0,
    delete: 0,
    destructive: primaryActions.filter(isDestructiveAppPlanAction).length,
    cascaded: actions.length - primaryActions.length,
  };

  for (const action of actions) {
    summary[action.type] += 1;
  }

  return summary;
};
