import { isDefined } from 'twenty-shared/utils';

import { type AppPlanAction } from '@/app/deployment/types/app-plan.type';

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

    if (!isDefined(root) || root === action) {
      primaryActions.push(action);
      continue;
    }

    cascadesByRoot.set(root, [...(cascadesByRoot.get(root) ?? []), action]);
  }

  return { primaryActions, cascadesByRoot };
};
