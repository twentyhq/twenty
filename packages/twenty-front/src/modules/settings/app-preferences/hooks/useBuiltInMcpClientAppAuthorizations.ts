import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { getBuiltInMcpClientAppAuthorizations } from '@/settings/app-preferences/utils/getBuiltInMcpClientAppAuthorizations';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { CurrentUserApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

export const useBuiltInMcpClientAppAuthorizations = (
  builtInMcpClientApp: BuiltInMcpClientApp,
) => {
  const { data, loading, error, refetch } = useQuery(
    CurrentUserApplicationAuthorizationsDocument,
    { fetchPolicy: 'cache-and-network' },
  );

  return {
    authorizations: getBuiltInMcpClientAppAuthorizations({
      authorizations: data?.currentUserApplicationAuthorizations ?? [],
      builtInMcpClientApp,
    }),
    loading: loading && !isDefined(data),
    hasLoadError: isDefined(error) && !isDefined(data),
    refetch,
  };
};
