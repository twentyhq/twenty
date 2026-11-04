import { getBuiltInMcpClientAppStatusesById } from '@/settings/app-preferences/utils/getBuiltInMcpClientAppStatusesById';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { CurrentUserApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

export const useBuiltInMcpClientAppStatusesById = () => {
  const { data, loading, error, refetch } = useQuery(
    CurrentUserApplicationAuthorizationsDocument,
    { fetchPolicy: 'cache-and-network' },
  );

  const hasLoaded = isDefined(data);
  const hasLoadError = isDefined(error) && !hasLoaded;

  return {
    statusesById: hasLoaded
      ? getBuiltInMcpClientAppStatusesById({
          authorizations: data.currentUserApplicationAuthorizations,
        })
      : {},
    isLoading: loading && !hasLoaded,
    hasLoadError,
    refetch,
  };
};
