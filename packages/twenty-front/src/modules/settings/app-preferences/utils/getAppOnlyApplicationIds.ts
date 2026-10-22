import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { isDefined } from 'twenty-shared/utils';

type AppOnlyApplicationIds = {
  appOnlyConnectionsApplicationId: string | undefined;
  appOnlyApplicationId: string | undefined;
};

export const getAppOnlyApplicationIds = ({
  group,
  applicationIdsWithConnectionsTab,
}: {
  group: Pick<
    ConnectedAccountGroup<{ applicationId?: string | null }>,
    'builtInAccount' | 'appAccounts'
  >;
  applicationIdsWithConnectionsTab: ReadonlySet<string>;
}): AppOnlyApplicationIds => {
  if (isDefined(group.builtInAccount)) {
    return {
      appOnlyConnectionsApplicationId: undefined,
      appOnlyApplicationId: undefined,
    };
  }

  const appOnlyConnectionsApplicationId = group.appAccounts
    .map(({ applicationId }) => applicationId)
    .find(
      (applicationId): applicationId is string =>
        isDefined(applicationId) &&
        applicationIdsWithConnectionsTab.has(applicationId),
    );

  if (isDefined(appOnlyConnectionsApplicationId)) {
    return {
      appOnlyConnectionsApplicationId,
      appOnlyApplicationId: appOnlyConnectionsApplicationId,
    };
  }

  return {
    appOnlyConnectionsApplicationId: undefined,
    appOnlyApplicationId: group.appAccounts[0]?.applicationId ?? undefined,
  };
};
