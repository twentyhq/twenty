import { CONNECTION_SCOPE_BY_LEGACY_VISIBILITY } from 'twenty-shared/application-runtime';
import { isDefined } from 'twenty-shared/utils';

import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import {
  type AppConnectionWithoutVisibility,
  withLegacyConnectionVisibility,
} from '@/sdk/logic-function/connections/utils/with-legacy-connection-visibility.util';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const LIST_APP_CONNECTIONS_QUERY = `
  query ListAppConnections($filter: ListAppConnectionsInput) {
    appConnections(filter: $filter) {
      id
      providerName
      name
      handle
      externalAccountId
      scope
      userWorkspaceId
      workspaceMemberId
      providerType
      accessToken
      scopes
      authFailedAt
      authFailedReason
    }
  }
`;

export type ListConnectionsFilter = {
  providerName?: string;
  userWorkspaceId?: string;
  scope?: AppConnection['scope'];
  /** @deprecated Use `scope` instead. */
  visibility?: AppConnection['visibility'];
};

export const listConnections = async ({
  visibility,
  ...filter
}: ListConnectionsFilter = {}): Promise<AppConnection[]> => {
  const { appConnections } = await postGraphqlRequest<
    { filter: Omit<ListConnectionsFilter, 'visibility'> },
    { appConnections: AppConnectionWithoutVisibility[] }
  >({
    query: LIST_APP_CONNECTIONS_QUERY,
    variables: {
      filter: {
        ...filter,
        scope:
          filter.scope ??
          (isDefined(visibility)
            ? CONNECTION_SCOPE_BY_LEGACY_VISIBILITY[visibility]
            : undefined),
      },
    },
    caller: 'listConnections',
  });

  return appConnections.map(withLegacyConnectionVisibility);
};
