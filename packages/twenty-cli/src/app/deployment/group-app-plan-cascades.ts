import { isDefined } from 'twenty-shared/utils';

import { isDestructiveAppPlanAction } from '@/app/deployment/is-destructive-app-plan-action';
import { type AppPlanAction } from '@/app/deployment/types/app-plan.type';

// A data-dropping deletion folds only into a data-dropping root, so the approval count never hides it.
const canFoldInto = ({
  action,
  root,
}: {
  action: AppPlanAction;
  root: AppPlanAction;
}) =>
  action.type === 'delete' &&
  root !== action &&
  (!isDestructiveAppPlanAction(action) || isDestructiveAppPlanAction(root));

// The server names each cascaded deletion's root; a root missing from the plan leaves it listed.
export const groupAppPlanCascades = (actions: AppPlanAction[]) => {
  const deletionByUniversalIdentifier = new Map(
    actions
      .filter((action) => action.type === 'delete')
      .map((action) => [action.universalIdentifier, action]),
  );
  const cascadesByRoot = new Map<AppPlanAction, AppPlanAction[]>();
  const primaryActions: AppPlanAction[] = [];

  for (const action of actions) {
    const root = isDefined(action.cascadedFromUniversalIdentifier)
      ? deletionByUniversalIdentifier.get(
          action.cascadedFromUniversalIdentifier,
        )
      : undefined;

    if (!isDefined(root) || !canFoldInto({ action, root })) {
      primaryActions.push(action);
      continue;
    }

    cascadesByRoot.set(root, [...(cascadesByRoot.get(root) ?? []), action]);
  }

  return { primaryActions, cascadesByRoot };
};
