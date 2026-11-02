import { getBuiltInMcpClientAppStatusesById } from '@/settings/app-preferences/utils/getBuiltInMcpClientAppStatusesById';
import { useQuery } from '@apollo/client/react';
import { CurrentUserApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

export const useBuiltInMcpClientAppStatusesById = () => {
  const { data } = useQuery(CurrentUserApplicationAuthorizationsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  return getBuiltInMcpClientAppStatusesById({
    authorizations: data?.currentUserApplicationAuthorizations,
  });
};
